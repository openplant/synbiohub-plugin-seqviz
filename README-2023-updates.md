# Note per l'utilizzo del plugin in sviluppo

1. Abbiamo duplicato l'endpoint `Run` (e rinominato in `RunLocal`), modificando anche il metodo per la chiamata da `POST` a `GET` 

2. In `RunLocal`, abbiamo rimosso il fetch del CVS e abbiamo pre-caricato i dati di esempio presi dal component **mRFP1** - **BBa_E1010**

3. Prima di lanciare il local server, il comando `yarn local` adesso chiama una versione di `yarn build` che rieffettua
la build del codice del frontend ogni volta che qualcosa all'interno di esso cambia

4. La porta su cui viene lanciato il local server è la `5002` invece della `5000`, a causa di conflitti sull'utilizzo della porta

## Note importanti

1. Per installare le dipendenze, utilizzare `npm install` invece di `yarn`, perché nel progetto è presente solo un `package-lock.json` 

2. Prima di far partire l'applicazione, installare le dipendenze globali (per queste si può usare tranquillamente `yarn`):
```
yarn global add nodemon concurrently
```
