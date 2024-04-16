// app.js

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { FixedPointCalculator } = require('./calculate.js');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Serve index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle POST requests 
app.post('/', (req, res) => {
    console.log("Received POST request to /calculate");
    console.log("Request body:", req.body);

    const fx = req.body.fx;
    const gx = req.body.gx;
    const errorLimit = req.body.error_limit;
    const initialValue = req.body.nilai_awal;
    const enableDecimalPoint = req.body.enable_decimal_point;
    const decimalPoint = req.body.decimal_point;

    console.log("fx:", fx);
    console.log("gx:", gx);
    console.log("errorLimit:", errorLimit);
    console.log("initialValue:", initialValue);
    console.log("enableDecimalPoint:", enableDecimalPoint);
    console.log("decimalPoint:", decimalPoint);

    const fp = new FixedPointCalculator();
    if (fx && gx && errorLimit && initialValue) {
        console.log("All required parameters are present.");

        fp.setFx(fx).setGx(gx);
        fp.setErrorLimit(errorLimit);
        fp.setInitial(initialValue);
        if (enableDecimalPoint == 'true') {
            fp.setDecimalPoint(decimalPoint);
        }
        const table = fp.calculatePoint();
        const finalResult = table[table.length - 1];

        if (finalResult.x == 0) {
            console.log("Final result x is 0. Sending response for invalid data.");
            res.send('<h2 class="text-center display-4">Coba bentuk g(x) yang lain</h2>');
            return;
        }


        console.log("Sending response with calculated results.");
        let resultHtml = `
            <div class="card">
            <div class="card-body" id="hasil-iterasi">
                <h2 class="display-5"><i class="fa fa-plane"></i> Hasil</h2>
                <hr>
                <div class="text-center">
                    Hasil : ${finalResult.x}
                    <br>
                    Total : ${table.length} iterasi
                </div>
                <hr>
                <div class="container">
                    <center>
                        <button data-toggle="collapse" class="btn btn-outline-primary btn-lg btn-block" data-target="#orekorekan">Tabel</button>
                    </center>
                    <div class="collapse py-2" style="margin-top:0px" id="orekorekan">
                        <div class="table-responsive">
                            <table class="table">
                                <thead class="thead-dark">
                                    <tr>
                                        <th scope="col">i</th>
                                        <th scope="col">x<sub>i</sub></th>
                                        <th scope="col">f(x<sub>i</sub>)</th>
                                        <th scope="col">g(x<sub>i-1</sub>)</th>
                                        <th scope="col">e</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${table.map((row, i) => `
                                        <tr>
                                            <th scope="row">${i}</th>
                                            <td>${row.x}</td>
                                            <td>${row.fx}</td>
                                            <td>${row.gx}</td>
                                            <td>${row.e}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <script>
        // Initialize Bootstrap collapse after injecting HTML
        $(document).ready(function() {
            $('#orekorekan').collapse();
        });
        </script>
        `;

        res.send(resultHtml);
    } else {
        console.log("Missing required parameters. Sending 400 response.");
        res.status(400).send('Bad request: Missing required parameters');
    }
});



// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
