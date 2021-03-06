(async () => {
    const {importAll, getScript} = await import(`https://rpgen3.github.io/mylib/export/import.mjs`);
    await getScript('https://code.jquery.com/jquery-3.3.1.min.js');
    const $ = window.$;
    const html = $('body').empty().css({
        'text-align': 'center',
        padding: '1em',
        'user-select': 'none'
    });
    const head = $('<div>').appendTo(html),
          body = $('<div>').appendTo(html),
          foot = $('<div>').appendTo(html);
    const rpgen3 = await importAll([
        'input',
        'css'
    ].map(v => `https://rpgen3.github.io/mylib/export/${v}.mjs`));
    const rpgen4 = await importAll([
        'hsl2rgb',
        'rgb2hsl'
    ].map(v => `https://rpgen3.github.io/hue/mjs/${v}.mjs`));
    $('<span>').appendTo(head).text('画像の色相だけ変える');
    const addBtn = (h, ttl, func) => $('<button>').appendTo(h).text(ttl).on('click', func);
    const msg = (()=>{
        const elm = $('<div>').appendTo(body);
        return (str, isError) => $('<span>').appendTo(elm.empty()).text(str).css({
            color: isError ? 'red' : 'blue',
            backgroundColor: isError ? 'pink' : 'lightblue'
        });
    })();
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    const dialog = async str => {
        msg(str);
        await sleep(30);
    };
    $('<input>').appendTo(body).prop({
        type: 'file'
    }).on('change', ({target}) => {
        imgElm.prop('src', URL.createObjectURL(target.files[0]));
        msg('ファイルから画像を読み込みました');
    });
    const inputURL = rpgen3.addInputStr(body,{
        label: '画像URL入力',
        value: 'https://i.imgur.com/uUZBOj6.png'
    });
    inputURL.elm.on('change', () => {
        imgElm.prop('src',inputURL());
        msg('Imgurから画像を読み込みました');
    });
    const imgElm = $('<img>').appendTo(body).prop({
        crossOrigin: 'anonymous'
    }).on('error', () => msg('CORSのためi.imgur.comの画像しか使えません', true));
    inputURL.elm.trigger('change');
    addBtn(body.append('<br>'), '処理開始', () => main()).css({
        color: 'white',
        backgroundColor: 'red'
    });
    const main = async () => {
        const img = imgElm.get(0),
              {width, height} = img,
              cv = $('<canvas>').prop({width, height}),
              ctx = cv.get(0).getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, width, height),
              {data} = imgData,
              arr = [];
        for(let i = 0; i < data.length; i += 4) {
            const i2 = i >> 2;
            if(i2 % width === 0) await dialog(`RGB to HSL (${i2}/${data.length >> 2})`);
            const [r, g, b, a] = data.slice(i, i + 4);
            if(!a) {
                arr.push(null);
                continue;
            }
            arr.push(rpgen4.rgb2hsl(r, g, b));
        }
        foot.empty();
        for(let i = 0; i < 12; i++) {
            addBtnSave($('<div>').appendTo(foot).text(`${i}:`), toCv(await changeHue(arr, i * 30, width), width, height).appendTo(foot));
        }
        await dialog(`finish`);
    };
    const changeHue = async (arr, hue, width) => {
        const data = new Uint8ClampedArray(arr.length << 2);
        for(const [i, v] of arr.entries()) {
            if(i % width === 0) await dialog(`HSL to RGB (${i}/${arr.length})`);
            if(!v) continue;
            const [h, s, l] = v,
                  [r, g, b] = rpgen4.hsl2rgb(hue, s, l);
            const i4 = i << 2;
            data[i4] = r;
            data[i4 + 1] = g;
            data[i4 + 2] = b;
            data[i4 + 3] = 255;
        }
        return data;
    };
    const toCv = (data, width, height) => {
        const cv = $('<canvas>').prop({width, height}),
              ctx = cv.get(0).getContext('2d');
        ctx.putImageData(new ImageData(data, width, height), 0, 0);
        return cv;
    };
    const addBtnSave = (h, cv) => addBtn(h, '画像の保存↓', () => $('<a>').prop({
        href: cv.get(0).toDataURL('image/png'),
        download: 'hue.png'
    }).get(0).click());
})();
