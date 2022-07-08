var express = require('express');
var app = express();
var bodyParser = require('body-parser')
var cors = require('cors')
const port = 8001;
let data = require('./data')

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: '10mb', type: 'application/json' }))
app.use(cors({
    allowedHeaders: ['token', 'content-type', 'locale', 'x-host', "user-agent", "x-forwarded-for"],
    exposedHeaders: ['token', 'content-type', 'locale', 'x-host', "user-agent", "x-forwarded-for"],
    origin: ['*']
}))

app.get('/api', (req, res) => {
    return res.status(200).json(data)
});

const checkbody = (body) => {
    const {name, age, gender, title} = body || {}
    const errMsg = []
    let validBody = true
    if(!name || name === ''){
        validBody = false
        errMsg.push('name is required.')
    }
    if(!Number.isInteger(Number(age))){
        validBody = false
        errMsg.push(`invalid age: ${age}.`)
    }
    if(['male', 'female'].indexOf(gender) < 0){
        validBody = false
        errMsg.push(`invalid gender: ${gender}.`)
    }
    if(!title || title === ''){
        validBody = false
        errMsg.push('title is required.')
    }

    return { valid: validBody, errMsg}

}

app.post('/api/:id?', (req, res) => {
    const body = req.body
    const { valid, errMsg} = checkbody(body)
    if(!valid){
        return res.status(400).json(errMsg)
    }
    const id = req.params.id
    const {name, age, gender, title} = body || {}
    if(id){
        const item = data.find(o=> o.id == id)
        if(item){
            item.name = name
            item.age = Number(age)
            item.gender = gender
            item.title = title
            return res.status(200).send('')
        }
        return res.status(400).json([`invalid id ${id}`])
    }
    
    const result = [...data]
    const maxIdItem = result.sort((a,b)=> a.id > b.id ? -1 : 1)[0]
    let dataId
    if(maxIdItem){
        dataId = maxIdItem.id + 1
    }else{
        dataId = 1001
    }
    data.push({
        id: dataId,
        name,
        gender,
        age: Number(age),
        title
    })
    return res.status(201).send('')
});

app.delete('/api/:id', (req, res) => {
    const id = req.params.id
    const item = data.find(o=> o.id == id)
    if(!item){
        return res.status(400).send(`${id} is not exist.`)
    }
    data = data.filter(o=> o.id != id)
    return res.status(200).send('')
})




app.listen(port, () => console.log(`Example app listening on port ${port}!`));