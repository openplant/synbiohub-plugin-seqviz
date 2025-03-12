# SynbioHub Plugin: SeqViz

## Project Description

Sequence Visualization Plugin is a visualization plugin engine for SynBioHub to enhance the functional annotations of DNA sequence which are coordinated with the SBOL Visual standard.

Original SeqViz plugin (from using [https://github.com/SynBioHub/Plugin-Visual-VisBOL-Js](https://github.com/SynBioHub/Plugin-Visual-Seqviz)): 
![image](https://github.com/user-attachments/assets/d9fcba2e-ece5-4e06-bbf6-86f47d11c670)

New SeqViz plugin (from this repo): 
![image](https://github.com/user-attachments/assets/2efb356f-fa12-42d2-a6ad-6a60d9be35cd)

Only the new SeqViz plugin is present on each part's page: see [example](https://hub.openbioeconomy.org/public/Marchantia_OpenPlant_Toolkit/OP_088/1).

## Development

To start both the frontend build and the backend server in dev mode:

```bash
yarn dev
```

## Deploy

### Configuration

On the server:

```bash
nano ~/synbiohub-plugins/docker-compose.yml
# services:
#     # ...
#     plugin-seqviz:
#         build: ./seqviz/.
#         ports:
#             - "127.0.0.1:5011:5011"
#         dns: 8.8.8.8
#         restart: always

nano /etc/Caddyfile
# hub.openbioeconomy.org:6011 {
#     reverse_proxy :5011
# }
```

### Update

The build script outputs two self-contained compiled JS files, one for the backend and one for the frontend.
To build the frontend and backend code, run:

```bash
yarn build
```

Then deploy `dist/`, together with the `Dockerfile`:

```bash
scp Dockerfile USER@SERVER:~/synbiohub-plugins/seqviz/
scp -r dist/ USER@SERVER:~/synbiohub-plugins/seqviz/
```

On the server, run:

```bash
cd ~/synbiohub-plugins/
docker-compose up --build -d
```

### SynbioHub Configuration

The plugin will run on port 5011 of the container, reverse-proxied on port 6011 of the server,
so this is the configuration that will need to be added in SynbioHub > Admin > Plugins:

| Name   | URL                    |
| ------ | ---------------------- |
| SeqViz | https://{SERVER}:6011/ |
