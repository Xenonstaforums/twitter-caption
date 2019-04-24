# twitter-caption :bird:

twitter-caption is a command-line tool that adds a Tweet-like caption to a given image.

```
echo -e 'Twitter: builds a nice, user-friendly social media platform\n\nMe:' | twitter-caption -i button-slap.png -o captioned-button-slap.png
```

## Installation

```
yarn global add twitter-caption # using Yarn
npm install --global twitter-caption # using npm
```

## Usage

```
Usage: twitter-caption [options]

Options:
  -V, --version              output the version number
  -i, --input-image <path>   path to input image
  -o, --output-image <path>  path to output image
  -t, --text <text>          text to add to the input image; if left unspecified, twitter-caption will read from stdin.
  -h, --help                 output usage information
```

## License

[AGPLv3](https://www.gnu.org/licenses/agpl-3.0.en.html)
