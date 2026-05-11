### 1. npm install next-intl
set up to use different languages in app, e.g. /en, /ru, /ua
all routes in app/[locale] directory. 
Create i18 folder at src/. In i18 folder create navigation. request, routing files
Create messages (translations) folder at the root directory. Create messages/en.json, messages/ru.json, messages/ua.json files. In each file add translations for each page. e.g. 
{
    "Navigation": {
        "logoTitle": "Movies"
    }
}



### 2. npm install better-auth
set up to use auth

### 3. npm install prisma --save-dev
npm install @prisma/client   
npm install @prisma/adapter-pg
npx prisma init
in schema file add to generator block:
generator client {
    provider = "prisma-client"
    output   = "../src/lib/generated/prisma"
}

npx prisma migrate dev --name init
npx prisma generate         



