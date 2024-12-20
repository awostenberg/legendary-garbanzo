# fableJA

Simple CAGR calculation on Github Pages

## Generate static site

*where `build` is `./build.sh` on macOS, and `.\build.cmd` on Windows*

```bash
dotnet tool restore
dotnet paket restore
yarn install
build -t GenerateSite ./gh-pages
# TODO: git magic here to commit contents of ./gh-pages folder to gh-pages branch
cp .git gh-pages/.git
cd gh-pages
git checkout gh-pages # plus some stuff to not actually checkout files
git add .
git commit -m "Update site to <commit-hash-here>"
git push origin gh-pages
```
