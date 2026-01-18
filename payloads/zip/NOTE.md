https://www.linkedin.com/flagship-web/rsc-action/actions/server-request?sduiid=updateGameState&parentSpanId=qYH%2BwTsrLIk%3D

```javascript
function transformPayload(payload, context) {
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
}
```
