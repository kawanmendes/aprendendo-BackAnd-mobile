const express = require('express');
const cord = require('cors');
const app = express();
const port = 3000;
app.use(cord());

app.get('/', (_req, res) => {
    res.json({
        message : 'MeetStrager API ',
        version:  '1.0.0',
        status : 'running',
       
    });
});
app.listen(port, () => {
    console.log(`server is running on port ${port}`)
    console.log(`http://localhost:${port}/`)
})
console.log(port)