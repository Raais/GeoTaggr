# GeoTaggr

Create [GeoGuessr](https://geoguessr.com) style pinpointing challenges for photos

![Screenshot](https://user-images.githubusercontent.com/64605172/184509255-ffa4e22c-52f0-4e8e-855c-b257ab53e425.png)

### [Play Here](https://raais.github.io/geotaggr)

#### [Example Game Here](https://raais.github.io/geotaggr/game?code=MjkuNjU3OTUwOTAyNTQwOTM2LDkxLjExNzAyODg4MTI2NjUmaHR0cHMlM0ElMkYlMkZpLmltZ3VyLmNvbSUyRndXdVI3Q1YuanBlZw)

## How to play?

1. Paste your coordinates and image url

<img  src="https://user-images.githubusercontent.com/64605172/184509097-c770f681-ce15-4b1c-9d9e-9ee3e483a16b.png"  title=""  alt="Screenshot"  width="250">

2. Generate link and share the challenge (you can opt for a masked url to hide details)

<img  src="https://user-images.githubusercontent.com/64605172/184509113-d5bf3ad4-7127-4295-8e0c-2fc749db3d4f.png"  title=""  alt="Screenshot"  width="600">

<img  src="https://user-images.githubusercontent.com/64605172/184509568-d90d319f-f923-4aa1-88d1-262c0656addb.png"  title=""  alt="Screenshot"  width="600">

3. Player will analyze the picture and guess

4. Score out of 5000. Profit.

## Disclaimer

GeoTaggr is not a GeoGuessr clone. It does not feature random locations from Google Street View, Mapillary, etc. Every "game" is a user generated challenge meant for other users.

It was designed especially as a convenience for pinpointing challenges like [GeoDetective](https://www.youtube.com/results?search_query=geodetective) games.

## Self host

This deployment uses Google Maps API with a limited quota per day due to costs.
If you want to self host, fork this repo, create your own API key on Google Maps Platform
(set restrictions and quotas), replace with yours at the bottom of [game.html](https://github.com/raais/geotaggr/blob/main/game.html)

## License

This is an open source project under the [MIT License](https://github.com/raais/geotaggr/blob/main/LICENSE). It is **NOT ASSOCIATED WITH [GEOGUESSR.COM](https://geoguessr.com)**
