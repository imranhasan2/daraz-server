const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const cors = require('cors')
require('dotenv').config()

app.use(cors())


const { DB_USER, DB_PASS } = process.env;

// Log environment variables
// console.log(DB_USER);

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${DB_USER}:${DB_PASS}@cluster0.bhkveen.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {

        const productCollection = client.db('darazDB').collection('products')
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        // get products from database

        app.get('/products', async (req, res) => {
            try {
                const query = req.query.search || "";
                const sortPrice=req.query.sortPrice || 'priceLowToHigh'
                console.log(sortPrice)

                const filter = {
                    name:{
                        $regex:query,
                        $options: 'i'
                    }
                }


                const sortPrices ={

                    
                    priceLowToHigh:{priceNumber : 1},
                    priceHighToLow:{priceNumber : -1},
                    dateNewest:{createdAt : -1}


                }

                const sortOrder = sortPrices[sortPrice] || { priceNumber: 1 }


                const pipeline =[
                    {

                    $match:filter
                },{

                    $addFields :{
                       priceNumber:{ $convert: {
                        input: "$price",
                        to: "double",
                        onError: null,   // Handle conversion errors gracefully
                        onNull: null     // Handle null values
                    }
                }
                    }
                },
                
                {    $sort :sortOrder}
            
            ]

                const result = await productCollection.aggregate(pipeline).toArray();
                res.send(result);

            } catch (error) {
                console.error('Error fetching products:', error);
                res.status(500).send('Internal Server Error');
            }
        });



        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})