# Note per l'utilizzo del plugin in sviluppo

1. Abbiamo duplicato l'endpoint `Run` (e rinominato in `RunLocal`), modificando anche il metodo per la chiamata da `POST` a `GET` 

2. In `RunLocal`, abbiamo rimosso il fetch del CVS e abbiamo pre-caricato i dati di esempio presi dal component **mCherry** (https://synbiohub.org/public/igem/mCherry/1)

3. All'originale `Run` si può passare in POST ad esempio il seguente oggetto, che si riferisce a un Component; l'url `complete_sbol` punta a un file XML in formato SBOL (che contiene quindi un blocco `ComponentDefinition`, necessario per passare correttamente il file):
```
{
    "complete_sbol": "https://synbiohub.org/public/CnDatabase/mCherry/1/sbol",
    "top_level": "https://synbiohub.org/public/CnDatabase/mCherry/1"
}
```

4. Prima di lanciare il local server, il comando `yarn local` adesso chiama una versione di `yarn build` che rieffettua
la build del codice del frontend ogni volta che qualcosa all'interno di esso cambia

5. La porta su cui viene lanciato il local server è la `5002` invece della `5000`, a causa di conflitti sull'utilizzo della porta

6. Nel `Dockerfile` (usato per la build dell'immagine del plugin) è stata aggiornata la versione di node (`16.20` al posto di `14`) perché non era più in grado di installare correttamente le dipendenze

7. Sempre nel `Dockerfile` è stata tolta l'opzione `--only=production` perchè ci serve installare (temporaneamente) `babel-node`, il quale viene utilizzato dal comando `npm run start-prod-server`

8. È stato quindi aggiunto il comando `build-local-docker-image` legato a uno script bash con lo stesso nome (fa la build della image usando come tag `local`)


## Note importanti

1. Per installare le dipendenze, utilizzare `npm install` invece di `yarn`, perché nel progetto è presente solo un `package-lock.json` 

2. Prima di far partire l'applicazione, installare le dipendenze globali (per queste si può usare tranquillamente `yarn`):
```
yarn global add nodemon concurrently
```
