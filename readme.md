<div align="center">
  <br>
  <h1> TripPin 旅圖：旅遊規劃、社交網站</h1>
  <strong>TripPin is a one-stop travel planning web application that enables user to explore, plan, and share trip itineraries.</strong>
  <div align="center">
    <a href="https://trip.rickli.shop/">Home Page</a> |
    <a href="https://youtu.be/Ey_vYHgRhOU">Video Intro</a> |
    <br>
    <br>
    <img width="500" alt="TripPin Logo" src="https://github.com/nauish/TripPin/assets/101254647/22ef68e3-9542-4f56-a38a-3687ddeb4304">
</div>
</div>
<br>

## Table of Contents
+ [Why use TripPin](https://github.com/nauish/TripPin?tab=readme-ov-file#why-use-trippin)
+ [Main Features](https://github.com/nauish/TripPin?tab=readme-ov-file#main-features)
+ [Tech Stack](https://github.com/nauish/TripPin?tab=readme-ov-file#tech-stacks)
+ [System Design](https://github.com/nauish/TripPin?tab=readme-ov-file#system-design)

## Why use TripPin?

Planning a trip can be difficult, especially when you have to search for information from different sources like Google or Blog posts, all while discussing with friends and families and jot them all down on a notebook.

What if you could see your itinerary on a map, and adjust the time and order of each activity? What if you could discuss with your friends and figure out your travel plans together?

TripPin aims to make the process of planning a trip easier and more enjoyable. You can start by creating a simple plan, then share your plans with your friends, or make them public for other travelers to use. You can also browse other people’s plans, and make a copy to suit your needs.

## Main Features
- Create trips with basic criteria, such as:
  - Budget
  - Country
  - Travel type (e.g. sightseeing, food, culture, etc.)
  - Travel duration
- See your plans on a map, and arrange the trip by dragging and dropping.
  ![動畫](https://github.com/nauish/TripPin/assets/101254647/479851d4-47d7-465e-b755-522432a08a8a)
- Edit location details
- Ask for optimized route
  ![動畫1](https://github.com/nauish/TripPin/assets/101254647/7949eef3-d215-4996-b0f1-c4a389b4ae47)
- Add checklists and items, set complete status to track your to-dos
  ![動畫1](https://github.com/nauish/TripPin/assets/101254647/d383d981-b15e-46d4-a6b9-d3ea530acee1)
- Share plans with friends, or make public for others to see and use.
  ![動畫2](https://github.com/nauish/TripPin/assets/101254647/6081d97e-b71d-4c3e-b26d-8c7a5afe2def)
- Chat with an AI assistant who can help them with planning, and answer questions.
- Add comments on other's trip and share ratings.
- Collaborate with travel mates in real-time.
- Sending locations, markers directly to other editors.
- Upload photos of your trip, and join travel plans.
- Text with friends and discuss upon trip locations.

## Technical Features
- Leveraged Express, React, PostgreSQL and AWS to design, develop and deploy a dynamic full-stack SPA that enables users to plan, collaborate and share trips with others by simply dragging and dropping within a Scrum adhered 5-week timeframe.
- Integrated Google Maps Platform API for geocoding, routing, and  for the user, with OpenAI API providing tailored trip planning advice.
- Enabled real-time collaborative editing, marker sending, and group chat via Socket.IO.
- Utilized Redis for mutex locking during collaboration, thereby preventing editing conflicts among users, with additional expiry time and heartbeat mechanism, ensuring seamless collaboration without disruptions. 
- Established 35+ thoroughly planned out RESTful API endpoints with various JWT authentication and Role-Based Access Control authorization levels that define trip creator, editor, and viewer permissions among public and private trips.
- Implemented a variant of nearest-neighbor algorithm for calculating coordinates stored using PostGIS geological data type, providing route optimization.
- Automated and streamlined a consistent CI/CD process using GitHub Actions to compile TypeScript server files, build and run Docker image on EC2, build client-side static files, upload to S3, and distribute to Cloudfront CDN.
- Devised and conducted automated testing for potential edge cases using Vitest.

## Tech Stacks

### Server

![image](https://img.shields.io/badge/Express%20js-000000?style=for-the-badge&logo=express&logoColor=white)
![image](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![image](https://img.shields.io/badge/Socket.io-010101?&style=for-the-badge&logo=Socket.io&logoColor=white)
![image](https://img.shields.io/badge/Amazon_AWS-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white)
![image](https://img.shields.io/badge/redis-%23DD0031.svg?&style=for-the-badge&logo=redis&logoColor=white)
![image](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![image](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)
![image](https://img.shields.io/badge/Node%20js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![image](https://img.shields.io/badge/Amazon%20EC2-FF9900.svg?style=for-the-badge&logo=Amazon-EC2&logoColor=white)
![image](https://img.shields.io/badge/Amazon%20RDS-527FFF.svg?style=for-the-badge&logo=Amazon-RDS&logoColor=white)
![image](https://img.shields.io/badge/Amazon%20S3-569A31.svg?style=for-the-badge&logo=Amazon-S3&logoColor=white)
- Server: Express in TypeSctipt
- Database: PostgreSQL with PostGIS extension on Amazon RDS
- Static storage: S3, Cloudfront
- Mutex Lock and rate-limiter: Redis on ElastiCache
- Real-time transmission: Socket.io

### Client
![image](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![image](https://img.shields.io/badge/OpenAI-412991.svg?style=for-the-badge&logo=OpenAI&logoColor=white)
![image](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![image](https://img.shields.io/badge/Google%20Maps-4285F4.svg?style=for-the-badge&logo=Google-Maps&logoColor=white)
![image](https://img.shields.io/badge/shadcn/ui-000000.svg?style=for-the-badge&logo=shadcn/ui&logoColor=white)
![image](https://img.shields.io/badge/Unsplash-000000.svg?style=for-the-badge&logo=Unsplash&logoColor=white)
![image](https://img.shields.io/badge/Vite-646CFF.svg?style=for-the-badge&logo=Vite&logoColor=white)
- Framework: Vite + React, Tailwind CSS, shadcn-ui
- Text chat: Socket.io
- API: Google Maps Platform, Unsplash, OpenAI GPT 3.5 Turbo

### Deployment:
![image](https://img.shields.io/badge/GitHub%20Actions-2088FF.svg?style=for-the-badge&logo=GitHub-Actions&logoColor=white)
![image](https://img.shields.io/badge/Docker-2496ED.svg?style=for-the-badge&logo=Docker&logoColor=white)
![image](https://img.shields.io/badge/Vitest-6E9F18.svg?style=for-the-badge&logo=Vitest&logoColor=white)
![image](https://img.shields.io/badge/k6-7D64FF.svg?style=for-the-badge&logo=k6&logoColor=white)
- CI/CD: GitHub Actions
- Containerization: Docker
- Testing: Vitest, k6

## System Design
![tpi drawio (1)](https://github.com/nauish/TripPin/assets/101254647/3ad05230-00eb-418c-a9fa-3e92b5f1a8da)
