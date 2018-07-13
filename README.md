# netiam-contrib-oauth

[![Build Status](https://travis-ci.org/netiam/contrib-oauth.svg)](https://travis-ci.org/netiam/contrib-oauth)
[![Dependencies](https://david-dm.org/netiam/contrib-oauth.svg)](https://david-dm.org/netiam/contrib-oauth)
[![npm version](https://badge.fury.io/js/netiam-contrib-oauth.svg)](http://badge.fury.io/js/netiam-contrib-oauth)

> A OAuth 2.0 plugin for netiam

## Example

```js
netiam()
  .oauth.token({
    userModel: User,
    tokenModel: Token,
    clientModel: Client,
    codeModel: Code
  })
  .json()
```

## Attention

Do not use `2.0`. Wrong passwords result in an positive match!

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)
