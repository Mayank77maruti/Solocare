FROM node:20-alpine
WORKDIR /app
COPY ./website/package*.json ./
RUN if grep -q "postinstall" package.json; then \
    sed -i 's/"postinstall": "npx prisma generate"/"postinstall": "echo Skipping Prisma generate during install"/' package.json; \
    fi
RUN npm install --ignore-scripts
RUN npm install @lottiefiles/dotlottie-react @11labs/react
COPY ./website/ ./
RUN mkdir -p prisma && \
    if [ ! -f ./prisma/schema.prisma ]; then \
    echo 'datasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n}\n\ngenerator client {\n  provider = "prisma-client-js"\n}' > ./prisma/schema.prisma; \
    fi
RUN npx prisma generate
EXPOSE 3000
CMD ["npm", "run", "dev"]
