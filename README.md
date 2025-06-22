<div align="center">

  <img src="https://res.cloudinary.com/aa1997/image/upload/v1717352483/xqqejvpf6hwmmntj438l.png" alt="logo" width="200" height="auto" />
  
# Maydān
  
  <p>
    Maydān Source Code
  </p>
  
  
<!-- Badges -->
   
<h4>
    <a href="https://twitterclone-gamma.vercel.app">View Demo</a>
  <span> · </span>
    <a href="https://github.com/SashenJayathilaka/Twitter-2-0-Clone/blob/master/README.md">Documentation</a>
  <span> · </span>
    <a href="https://github.com/SashenJayathilaka/Twitter-2-0-Clone/issues">Report Bug</a>
  <span> · </span>
    <a href="https://github.com/SashenJayathilaka/Twitter-2-0-Clone/issues">Request Feature</a>
  </h4>
</div>

<br />

<!-- Table of Contents -->
## :notebook_with_decorative_cover: Table of Contents

- [About the Project](#star2-about-the-project)
  * [Tech Stack](#space_invader-tech-stack)
  * [Environment Variables](#key-environment-variables)
- [Getting Started](#toolbox-getting-started)
  * [Prerequisites](#bangbang-prerequisites)
  * [Installation](#gear-installation)
  * [Run Locally](#running-run-locally)
  * [Deployment](#triangular_flag_on_post-deployment)
- [Contact](#handshake-contact)

<!-- About the Project -->
## :star2: About the Project

![forthebadge](https://forthebadge.com/images/badges/built-with-love.svg)
![forthebadge](https://forthebadge.com/images/badges/for-you.svg)
![forthebadge](https://forthebadge.com/images/badges/powered-by-coffee.svg)

### :space_invader: Tech Stack

<details>
  <summary>Client</summary>
  <ul>
    <li><a href="https://#/">Typescript</a></li>
    <li><a href="https://nextjs.org/">Next.js</a></li>
    <li><a href="https://reactjs.org/">React.js</a></li>
    <li><a href="https://tailwindcss.com/">TailwindCSS</a></li>
  </ul>
</details>

<details>
<summary>Database</summary>
  <ul>
    <li><a href="https://neo4j.com/">Neo4j Graph Database</a></li>
  </ul>
</details>

<br />

<table>
    <tr>
        <td>
<a href="#"><img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" alt="" width="30" height="30" /></a>
        </td>
                <td>
<a href="#"><img src="https://user-images.githubusercontent.com/99184393/183096870-fdf58e59-d78c-44f4-bd1c-f9033c16d907.png" alt="Google" width="30" height="30" /></a>
        </td>
                        <td>
<a href="#"><img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-plain.svg" alt="Google" width="30" height="30" /></a>
        </td>
                        <td>
<a href="#"><img src="https://user-images.githubusercontent.com/99184393/179383376-874f547c-4e6f-4826-850e-706b009e7e2b.png" alt="" width="30" height="30" /></a>
        </td>
                        <td>
<a href="#"><img src="https://user-images.githubusercontent.com/99184393/180462270-ea4a249c-627c-4479-9431-5c3fd25454c4.png" alt="" width="30" height="30" /></a>
        </td>
                                <td>
<a href="#"><img src="https://dist.neo4j.com/wp-content/uploads/20230926084108/Logo_FullColor_RGB_TransBG.svg" alt="" width="30" height="30" /></a>
        </td>
                                <td>
<a href="#"><img src="https://res.cloudinary.com/aa1997/image/upload/v1717352483/xqqejvpf6hwmmntj438l.png" alt="" width="30" height="30" /></a>
        </td>
    </tr>
</table>

## 	:toolbox: Getting Started
### :bangbang: Prerequisites
- Sign up for a Supabase account <a href='https://supabase.com/'>HERE</a>
- Sign up for a Neo4j account <a href='https://neo4j.com/'>HERE</a>
- Install Node JS in your computer <a href='https://nodejs.org/en/'>HERE</a>

<!-- Env Variables -->
### :key: Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`NEXT_PUBLIC_NEO4J_CONNECTION_URI`
`NEXT_PUBLIC_NEO4J_CONNECTION_USER`
`NEXT_PUBLIC_NEO4J_CONNECTION_PWD`
`NEXT_PUBLIC_BASE_URL`

`GOOGLE_CLIENT_ID`
`GOOGLE_CLIENT_SECRET`


This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### :gear: Installation

![](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![](https://img.shields.io/badge/next.js-20232A?style=for-the-badge&logo=next.js&logoColor=61DAFB)

Install my-project with npm
```
npx create-next-app@latest --ts my-project
```
```
cd my-project
```

Install dependencies

### :test_tube: Install Tailwind CSS with Next.js
#### Install Tailwind CSS
![](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

Install tailwindcss and its peer dependencies via npm, and then run the init command to generate both ``tailwind.config.js`` and ``postcss.config.js``.

```
npm install -D tailwindcss postcss autoprefixer
```
```
npx tailwindcss init -p
```
#### Configure your template paths
Add the paths to all of your template files in your ``tailwind.config.js`` file.
<br>
```
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```
#### Add the Tailwind directives to your CSS
Add the ``@tailwind`` directives for each of Tailwind’s layers to your ``./styles/globals.css`` file.
```
@tailwind base;
@tailwind components;
@tailwind utilities;
```
Install dependencies

<a href="https://github.com/SashenJayathilaka/Twitter-2-0-Clone/blob/master/package.json" target="_blank">🔶 Dependency Info</a>

<!-- Run Locally -->
### :running: Run Locally

![](https://img.shields.io/badge/GIT-E44C30?style=for-the-badge&logo=git&logoColor=white)

Clone the project

```bash
  git clone https://github.com/QamarLabs/QamarSocial-X-Template.git
```

Install dependencies

```bash
  npm install
```
Start the server

```bash
  npm run dev
```

<hr />

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

<hr />

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

### Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

<!-- Deployment -->
### :triangular_flag_on_post: Deployment

To deploy this project run

##### Deploy on Vercel

![](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## :handshake: Contact

Project Link: [https://twitterclone-gamma.vercel.app](https://twitterclone-gamma.vercel.app)
