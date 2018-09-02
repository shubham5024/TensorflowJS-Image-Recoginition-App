$("#image-selector").change(function () {
    let reader = new FileReader();
    reader.onload = function () {
        let dataURL = reader.result;
        $("#selected-image").attr("src", dataURL);
        $("#prediction-list").empty();
    }
    let file = $("#image-selector").prop("files")[0];
    reader.readAsDataURL(file);
}); 
let model;
(async function () {
    model = await tf.loadModel("http://127.0.0.1:8080/tjfs-model/Mobilenet/model.json");
    $(".progress-bar").hide();
})();

$("#predict-button").click(async function(){
    let image = $('#selected-image').get(0);
    let tensor=tf.fromPixels(image)
        .resizeNearestNeighbor([224,224])
        .toFloat()
        .expandDims();
        /*
        

    let meanImageNetRGB={
        red:123.68,
        green:116.779,
        blue:103.939
    };

    let indices=[
        tf.tensor1d([0],"int32"),
        tf.tensor1d([1],"int32"),
        tf.tensor1d([2],"int32")
    ];

    let centeredRGB={
        red:tf.gather(tensor, indices[0],2)
            .sub(tf.scalar(meanImageNetRGB.red))
            .reshape([50176]),
        green:tf.gather(tensor, indices[1],2)
            .sub(tf.scalar(meanImageNetRGB.red))
            .reshape([50176]),
        blue:tf.gather(tensor, indices[2],2)
            .sub(tf.scalar(meanImageNetRGB.red))
            .reshape([50176])
    };

    let processedTensor=tf.stack([centeredRGB.red,centeredRGB.green,centeredRGB.blue],1)
        .reshape([224,224,3])
        .reverse(2)
        .expandDims();*/

let predictions = await model.predict(tensor).data();
let top5 = Array.from(predictions)
    .map(function (p, i) {
        return {
            probability: p,
            className: IMAGENET_CLASSES[i]
        };
    }).sort(function (a, b) {
        return b.probability - a.probability;
    }).slice(0, 5);

    $("#prediction-list").empty();
    top5.forEach(function (p) {
        $("#prediction-list").append(`<li>${p.className}: ${p.probability.toFixed(6)}</li>`);
    });
});