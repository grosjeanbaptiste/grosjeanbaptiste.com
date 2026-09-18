# Serve the built site locally the way a static host does.
#
# Moved here from the grosjeanbaptiste monorepo, which used to hold a second
# copy of this site and built the image from it. The site now lives in this
# repo only, so the image is built from the repo root; .dockerignore keeps the
# toolchain (generator, LaTeX sources, DSL, CI) out of the served tree.
FROM nginx:1.27-alpine

COPY . /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
