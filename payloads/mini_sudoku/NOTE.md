This is how the URL usually looks like

https://www.linkedin.com/voyager/api/graphql?action=execute&queryId=voyagerIdentityDashGames.f8508525e36bee5f9a5ab6b637854d87

Rewriting the time is enough

```javascript
function transformPayload(payload, context) {
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
  record.timeElapsed = 5;
  console.info('[TM rewrite] timeElapsed after:', record.timeElapsed);

  return payload;
}
```
