# 8ayap manga reader

Minimal static gallery/reader site for translated manga works, intended for GitHub Pages at `8ayap.github.io`.

## Adding a work

1. Put the page images in `works/<work-id>/`.
2. Put the downloadable zip at `downloads/<work-id>.zip`.
3. Add an entry to `works.json`.

Example:

```json
{
  "id": "example-work",
  "title": "Example Work",
  "pages": [
    "works/example-work/001.jpg",
    "works/example-work/002.jpg"
  ],
  "download": "downloads/example-work.zip"
}
```

The first image in `pages` is used as the home-page thumbnail.
