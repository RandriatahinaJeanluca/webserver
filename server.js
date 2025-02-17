const express= require('express');
const bodyParserequire=require('body-parser');
const axios=require('axios');
const request=require('request');
require('dotenv').config();
const app=express();
const PORT=3000;

//verification de l'indenfication par token
const page_token='led_token_messenger';
const esp32_url='htt://192.166.137.189/requete';//configuration d'esp32
app.use(bodyParserequire.json());//convertion des requêtes en format json
//router pour la validation de webhook messenger
app.get('webhook',(req,res)=>{
   const verify_token='twwt';
   const mode=req.query['hub.mode'];
   const token=req.query['hub.verify_token']
   const challenge=req.query['hub.verify_token'];
   if(mode && token){
    if(mode=='subscribe'&& token==verify_token){
        console.log('webhook verify');
        res.status(200).send(challenge);
    }
    else{
        res.status(403);
    }
   }
});
app.post('/webhook',async(req,res)=>{
    const body=req.body;
    if(body.objet==='page'){
       body.entry.forEach(async(entry) => {
          const webhook_event=entry.messaging[0];
          const sender_psid=webhook_event.sender.id;
          if(webhook_event.message){
            const message=webhook_event.message.text.toLowercase();
            console.log('message reçu ',message);
            if(message.includes('on')||message.includes('allume')){
                const espReponse=await envoyerEsp('on');
                envoyerMessenger(sender_psid,espReponse);
            }else if(message.includes('off')||message.includes('enteint')){
                const espReponse=await envoyerEsp('on');
                envoyerMessenger(sender_psid,espReponse);
            }else{
                envoyerMessenger(sender_psid,"commande que vous composez aucun de mot 'off' ou 'enteint' ou 'on' ou 'alume'");
            }
          }
       });
       res.status(200).send('envent receive');
    }
    else res.sendStatus(404);
});
async function envoyerEsp(etat){
    try{
        const reponse=await fetch(`${esp32_url}?etat=${etat}`);
        const data=await reponse.text();
        return `l'esp32 repond:${data}`;
    }catch(error){
        console.error(error);
        return "erreur lors de la communication avec l'esp32";
    }
}
function envoyerMessenger(sender_psid,reponse){
    const request_body={
        recipient:{id:sender_psid},
        message:{text:reponse}
    };
    fetch(`https://facebook.com/v12.0/me/messages?access_token=${page_token}`,{
        method:post,
        body:JSON.stringify(request_body),
        headers:{'content-type':'application/json'}
    })
    .then(res=>{
        if(!res.ok)
        throw new Error('erreur lors de l\'envoi du message'); 
    })
    .catch(error=>console.error('erreur messenger :',error));
}



app.listen(PORT,()=>{
    console.log('ooop');
});