# MPD Transformer

## Description

MPD Transformer is a Node.js application that fetches a DASH MPD file from a given URL, modifies the MPD file by removing certain Period chunks, and returns the modified MPD file.

## Installation

1. Clone the repository: `git clone https://github.com/ivesdebruycker/mpd-transformer.git`
2. Navigate to the project directory: `cd mpd-transformer`
3. Install the dependencies: `npm install`

## Usage

1. Start the server: `npm run start`
2. Send a GET request to `http://localhost:3000/?url=http://example.com/path/to/file.mpd`, replacing `http://example.com/path/to/file.mpd` with the URL of the MPD file you want to transform.
