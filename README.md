# paya8

A small static site for reading translated manga works.

The site has a simple home page, gallery view, reader view, keyboard/click navigation, and download links for each work.

## Site Data

Works are defined in `works.json`. Each entry includes an id, title, ordered page image paths, and a download URL.

Images are served from `works/<work-id>/`. Large zip downloads are hosted as GitHub Release assets instead of being committed to the repository.

## Adding Works

1. Put the page images in `works/<work-id>/`.
2. Upload the downloadable zip as a GitHub Release asset.
3. Add or update the entry in `works.json`.

Example:

```json
{
  "id": "example-work",
  "title": "Example Work",
  "pages": [
    "works/example-work/001.jpg",
    "works/example-work/002.jpg"
  ],
  "download": "https://github.com/paya8/paya8.github.io/releases/download/tag-name/example-work.zip"
}
```

The first image in `pages` is used as the home-page thumbnail.
