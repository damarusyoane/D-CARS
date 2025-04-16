import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
const port = 3000;
app.use(cors());
app.use(bodyParser.text(
    { type: 'text/plain' }));
app.use(bodyParser.json(
    { type: 'application/json' }));

app.listen(port,()=>{
    console.log("Server is running on port: " + port);
});
app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.get('/about',(req,res)=>{
    res.send('About this page');
});
app.post('/form',(req,res)=>{
    console.log(req.body);
    res.send('Form received!');
});