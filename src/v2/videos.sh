#!/bin/bash
cd "$(dirname "$0")"
for it in "hero raw/hero-1.jpg" "wokstudio raw/wokstudio-1.jpg" "kokumpour raw/kokumpour-2.jpg" "steamer raw/steamer-169.jpg" "baodown raw/baodown-169.jpg"; do ./vid.sh $it; sleep 30; done
echo VIDEOS-DONE
