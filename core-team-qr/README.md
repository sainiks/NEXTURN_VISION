# Nexturn Core Team — Print QR Codes

Each of the 13 members has their own folder with an SVG and a PNG. Use `manifest.csv` to match a cardholder to their files and exact destination URL.

- **Use the SVG for printing.** It is vector artwork sized to 30 × 30 mm, including the white margin. Use the PNG if your layout software does not support SVG.
- Keep the black code on white, preserve the full white margin on all sides, and do not stretch, crop, or overlay the artwork.
- The codes point to `https://nexturn-vision.vercel.app/team/<member-slug>`. The individual URLs require this site's new card routes to be deployed; they are not live just because the files exist.
- Before the full print run, scan a proof at actual card size with a phone. Check that the URL opens without a login and that the card shows the correct name.
