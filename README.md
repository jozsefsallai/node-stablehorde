# node-stablehorde

Unofficial Node.js API client for [Stable Horde][stablehorde-url].

## Getting Started

Install the module:

```bash
npm install stablehorde
# or
yarn add stablehorde
```

Instantiate the client:

```js
const { Client } = require('stablehorde');

const stablehorde = new Client({
  apiKey: 'your-api-key',
});
```

### Async Mode

You can use the methods offered by the client object directly. When you do this,
the polling logic is left to you.

```js
// initiate a generation request
const request = await stablehorde.generateAsync({
  prompt: 'Painting of a dachshund drinking water in the style of Van Gogh',
}); // initiate a generation request

// check the status of the request
const status = await stablehorde.check(request);

// get the resulting generations
// you should only call this if the status object says the request is complete
// you can only send this request twice every minute
const generations = await stablehorde.generations(request);
```

### Event Emitter Mode

You can also let the library handle the polling logic for you in an event
emitter style. This is the recommended way to use the library.

```js
const handler = client.newRequestHandler(10000); // poll every 10 seconds

handler.on('created', (request) => {
  console.log('request created', request);
});

handler.on('statusPolled', (status) => {
  console.log('status polled', status);
});

handler.on('finished', (generations) => {
  console.log('generations finished', generations);
});

handler.on('error', (err) => {
  console.error('error', err);
});

handler.generate({
  prompt: 'Painting of a dachshund drinking water in the style of Van Gogh',
});
```

## Join The Horde!

Stable Horde is run by individuals all around the world. If you want to help
out and reduce waiting times for everyone, consider [joining the horde][join-horde-url]!

## For Contributors

`node-stablehorde` is written in TypeScript, therefore, you have to compile it
to JavaScript if you'd like to test your changes. You may do so using the
following command:

```
npm run build
```

The library does not currently employ any unit testing measures, however, if you
would like to contribute to the library, please make sure that your changes pass
linting. You can run the following command to check:

```
npm run lint
```

## License

MIT. Please read the LICENSE file for more information.

[stablehorde-url]: https://stablehorde.net/
[join-horde-url]: https://github.com/db0/AI-Horde/blob/main/README_StableHorde.md
