(async () => {
    const {importAll, getScript} = await import(`https://rpgen3.github.io/mylib/export/import.mjs`);
    await getScript('https://code.jquery.com/jquery-3.3.1.min.js');
    const $ = window.$;
    const html = $('<div>').appendTo($('body')).css({
        'text-align': 'center',
        padding: '1em',
        'user-select': 'none'
    });
    const head = $('<div>').appendTo(html),
          body = $('<div>').appendTo(html),
          foot = $('<div>').appendTo(html);
    const rpgen3 = await importAll([
        'css'
    ].map(v => `https://rpgen3.github.io/mylib/export/${v}.mjs`));
    $('<span>').appendTo(head).text('画像の色相だけ変える');
    const addBtn = (h, ttl, func) => $('<button>').appendTo(h).text(ttl).on('click', func);
    const {rgb2hsl} = await import('https://rpgen3.github.io/hue/mjs/rgb2hsl'),
          hsl2rgb = (h, s, l) => rpgen3.getRGBA(`hsl(${h},${s}%,${l}%)`);
    const msg = (()=>{
        const elm = $('<div>').appendTo(body);
        return (str, isError) => $('<span>').appendTo(elm.empty()).text(str).css({
            color: isError ? 'red' : 'blue',
            backgroundColor: isError ? 'pink' : 'lightblue'
        });
    })();
    $('<input>').appendTo(body).prop({
        type: 'file'
    }).on('change', ({target}) => {
        imgElm.prop('src', URL.createObjectURL(target.files[0]));
        msg('ファイルから画像を読み込みました');
    });
    const inputURL = rpgen3.addInputStr(body,{
        label: '画像URL入力',
        value: 'https://i.imgur.com/IRQAYsN.png'
    });
    inputURL.elm.on('change', () => {
        imgElm.prop('src',inputURL());
        msg('Imgurから画像を読み込みました');
    });
    const imgElm = $('<img>').appendTo(body).prop({
        crossOrigin: 'anonymous'
    }).on('error', () => msg('CORSのためi.imgur.comの画像しか使えません', true));
    addBtn(body, '処理開始', () => main());
    const main = () => {
        const img = imgElm.get(0),
              {width, height} = img,
              cv = $('<canvas>').prop({width, height}),
              ctx = cv.get(0).getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, width, height),
              {data} = imgData,
              arr = [];
        for(let i = 0; i < data.length; i += 4) {
            const [r, g, b, a] = data.slice(i, i + 4);
            if(!a) {
                arr.push(null);
                continue;
            }
            arr.push(rgb2hsl(r, g, b));
        }
        foot.empty();
        for(let i = 0; i < 12; i++) addBtnSave(toCv(changeHue(arr, i * 30), width, height).appendTo(foot));
        foot.each((i, e) => $(e).after('<br>'));
    };
    const changeHue = (arr, hue) => {
        const data = new Uint8ClampedArray(arr.length << 2);
        for(const [i, v] of arr.entries()) {
            if(v) continue;
            const [h, s, l] = v,
                  [r, g, b] = hsl2rgb(hue, s, l);
            const i4 = i << 2;
            data[i4] = r;
            data[i4 + 1] = g;
            data[i4 + 2] = b;
        }
        return data;
    };
    const toCv = (data, width, height) => {
        const cv = $('<canvas>').prop({width, height}),
              ctx = cv.get(0).getContext('2d');
        ctx.putImageData(new ImageData(data, width, height), 0, 0);
        return cv;
    };
    const addBtnSave = cv => addBtn(foot, '↑画像の保存', () => $('<a>').prop({
        href: cv.get(0).toDataURL('image/png'),
        download: 'hue.png'
    }).get(0).click());
})();
