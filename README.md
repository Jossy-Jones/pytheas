# Pytheas

```js
const Pytheas = require('pytheas')
const app = Pytheas()

app.listen(3000);
app.routes([
    {
        path: "/",
        method: "get",
        handler: (context)=>{
            context.response.send("Hello World!");
        }
    },
])
```

## Installation

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/).

Before installing, [download and install Node.js](https://nodejs.org/en/download/).
Node.js 0.10 or higher is required.

If this is a brand new project, make sure to create a `package.json` first with
the [`npm init` command](https://docs.npmjs.com/creating-a-package-json-file).

Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```console
$ npm install pytheas
```