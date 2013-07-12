#!/bin/bash -e

#
# Pack a Chromium extension directory into crx and zip formats ready for upload to the Chrome Web Store or for loading
# manually.
#

# Default pem path
key="./temporary-tab.pem"

# Check if an alternative pem path has been provided
if [ -r "$1" ]; then
	key="$1"
fi

dir=$(pwd -P)
name=$(basename "$dir")
crx="$name.crx"
pub="$name.pub"
sig="$name.sig"
zip="$name.zip"

# Clean up on exit
trap 'rm -f "$pub" "$sig"' EXIT

# Zip up the dir
(cd "$dir" && zip -qr -9 -x *.git* 'nbproject/*' $key $crx build.sh .DS_Store -X "$dir/$zip" .)

echo "Wrote $zip"

# Check that the final pem path is loadable
if [ ! -r "$key" ]; then
	echo "The specified key file ($key) could not be loaded. Only the .zip file was created."
	exit 0
fi

# Generate signature
openssl sha1 -sha1 -binary -sign "$key" < "$zip" > "$sig"

# Generate public key
openssl rsa -pubout -outform DER < "$key" > "$pub" 2>/dev/null

byte_swap () {
  # Take "abcdefgh" and return it as "ghefcdab"
  echo "${1:6:2}${1:4:2}${1:2:2}${1:0:2}"
}

crmagic_hex="4372 3234" # Cr24
version_hex="0200 0000" # 2
pub_len_hex=$(byte_swap $(printf '%08x\n' $(ls -l "$pub" | awk '{print $5}')))
sig_len_hex=$(byte_swap $(printf '%08x\n' $(ls -l "$sig" | awk '{print $5}')))
(
  echo "$crmagic_hex $version_hex $pub_len_hex $sig_len_hex" | xxd -r -p
  cat "$pub" "$sig" "$zip"
) > "$crx"
echo "Wrote $crx"