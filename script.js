// ==UserScript==
// @name         Localhost: rewrite JSON payload for voyagerIdentityDashGames
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Intercept fetch/XHR on localhost and rewrite JSON payload for matching requests.
// @match        https://www.linkedin.com/games/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(() => {
  'use strict';

  const ROUTES = [
    {
      match: 'voyagerIdentityDashGames',
      transformPayload(payload, context) {
        console.info('[TM rewrite] transformPayload start:', context?.url);

        if (!payload || typeof payload !== 'object') {
          console.info('[TM rewrite] payload is not an object; skipping');
          return payload;
        }

        const record = payload?.variables?.entity?.entity?.gameStoredRecord;
        if (!record || typeof record !== 'object') {
          console.info('[TM rewrite] gameStoredRecord not found; skipping');
          return payload;
        }

        console.info('[TM rewrite] timeElapsed before:', record.timeElapsed);
        record.timeElapsed = 2;
        console.info('[TM rewrite] timeElapsed after:', record.timeElapsed);

        return payload;
      },
    },
    {
      match: 'updateGameState',
      transformPayload(payload, context) {
        console.info('[TM rewrite] transformPayload:', context?.url);

        if (!payload || typeof payload !== 'object') {
          console.info('[TM rewrite] payload not an object; skipping');
          return payload;
        }

        const TARGET_KEY = 'gameBoardTimeElapsed';
        const NEW_VALUE_OBJ = { type: 'bigint', value: '3000' };

        const update = (arr, label) => {
          if (!Array.isArray(arr)) {
            console.info(`[TM rewrite] ${label}: not an array; skipping`);
            return 0;
          }

          let hits = 0;
          for (const item of arr) {
            if (item && typeof item === 'object' && item.key === TARGET_KEY) {
              console.info(`[TM rewrite] ${label}: match found; overwriting value`, {
                before: item.value,
                after: NEW_VALUE_OBJ,
              });

              item.value = { ...NEW_VALUE_OBJ };
              hits++;
            }
          }

          console.info(`[TM rewrite] ${label}: updated ${hits} item(s)`);
          return hits;
        };

        const hits1 = update(payload.states, 'payload.states');
        const hits2 = update(payload?.requestedArguments?.states, 'payload.requestedArguments.states');

        console.info('[TM rewrite] done:', { updated: hits1 + hits2 });
        return payload;
      },
    },
  ];

  function findRoute(url) {
    if (typeof url !== 'string') return null;
    return ROUTES.find(r => url.includes(r.match)) || null;
  }

  const originalFetch = window.fetch;

  window.fetch = async function patchedFetch(input, init) {
    const req = new Request(input, init);
    const url = req.url;
    const method = (req.method || 'GET').toUpperCase();

    const route = findRoute(url);
    if (!route || method === 'GET' || method === 'HEAD') {
      return originalFetch(input, init);
    }

    console.info('[TM rewrite] captured matching fetch:', { url, method, match: route.match });

    const bodyText = await req.clone().text();

    let json;
    try {
      json = JSON.parse(bodyText);
    } catch {
      console.info('[TM rewrite] body is not valid JSON; skipping rewrite');
      return originalFetch(input, init);
    }

    const rewritten = route.transformPayload(json, { url, transport: 'fetch', method });
    const newBodyText = JSON.stringify(rewritten);

    const newHeaders = new Headers(req.headers);
    newHeaders.set('content-type', 'application/json;charset=UTF-8');

    return originalFetch(new Request(req, { headers: newHeaders, body: newBodyText }));
  };
})();
