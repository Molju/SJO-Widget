import './index.scss';
import standIcon from './assets/imgs/stand.png';
import shopIcon from './assets/imgs/shop.png';
import ru_scheme from './assets/imgs/ru_scheme@2.png';
import en_scheme from './assets/imgs/en_scheme@2.png';
import panzoom from 'panzoom';
import * as PIXI from 'pixi.js';

class Widget {
    constructor(root, options) {
        if(!root.style.position) {
            root.style.position = 'relative';
        }

        this.wrapper = document.createElement('div');
        this.wrapper.className = 'wrapper';
        // добавляем врапер в корневой контейнер
        root.appendChild(this.wrapper);
        this.currentIndex = null;
        this.data = [];

        // врапер схемы и точек
        this.schemePanZoom = document.createElement('div');
        this.schemePanZoom.className = 'schemePanZoom';
        this.schemeWrapper = document.createElement('div');
        this.schemeWrapper.className = 'schemeWrapper';
        this.wrapper.appendChild(this.schemeWrapper)
        this.wrapper.appendChild(this.schemePanZoom);

        //врапер переключателей
        this.switchersWrapper = document.createElement('div');
        this.switchersWrapper.className = 'switchersWrapper';
        this.wrapper.appendChild(this.switchersWrapper);

        // схема
        this.app = new PIXI.Application({
                width: this.wrapper.offsetWidth,
                height: this.wrapper.offsetHeight,
                antialias: true,
                transparent: true,
                resolution: window.devicePixelRatio,
                autoDensity: true,
                autoResize: true
            }
        );
        // схема
        let scheme;
        switch(options.lang) {
            case 'ru':
                scheme = ru_scheme;
                break;
            case 'en':
                scheme = en_scheme;
                break;
            default:
                scheme = ru_scheme;
                break;
        }
        this.scheme = new PIXI.Container();
        this.app.loader.add('scheme', scheme).load((loader, resources) => {
            const scale = 0.5;//0.24;
            const schemeSprite = new PIXI.Sprite(resources['scheme'].texture);
            schemeSprite.pivot.set(0.5);
            schemeSprite.scale.set(scale);
            this.scheme.setTransform((this.wrapper.offsetWidth - (resources['scheme'].texture.orig.width * scale)) / 2,(this.wrapper.offsetHeight - (resources['scheme'].texture.orig.height * scale)) / 2.15);
            this.scheme.addChild(schemeSprite);

            // точки
            options.data.forEach(item => {
                this.addData({
                    title: item.title,
                    icon: item.icon,
                    points: item.points
                });
            });

            this.app.stage.addChild(this.scheme);

            //выбираем первый свитчер
            if(this.data.length) {
                this.setSwitcher(0);
            }

            window.addEventListener('resize', () => {
                this.app.renderer.resize(this.wrapper.offsetWidth, this.wrapper.offsetHeight);
            })
        });


        // вставляем в DOM
        this.schemeWrapper.insertBefore(this.app.view, this.schemeWrapper.firstElementChild);

        //схема-конец


        // зум и перемещение
        const pz = panzoom(this.schemePanZoom, {
            maxZoom: 1.8,
            minZoom: 0.3,
            initialZoom: 0.8
        });
        pz.on('transform', () => {
            //this.scheme.transform.setFromMatrix()
            const transformData = this.schemePanZoom.style.transform.match(/matrix\(([\d-.]+),\s*([\d-.]+),\s*([\d-.]+),\s*([\d-.]+),\s*([\d-.]+),\s*([\d-.]+)\)/);
            const matrix = new PIXI.Matrix(transformData[1],transformData[2],transformData[3],transformData[4],transformData[5],transformData[6]);
            this.app.stage.transform.setFromMatrix(matrix);

        });

        // остановка/ возобновление событий панзума, чтобы не двигалась карта при выборе категории
        this.switchersWrapper.onpointerdown = () => {
            pz.pause();
        }

        this.switchersWrapper.onpointerup = () => {
            pz.resume();
        }


        this.schemeWrapper.style.top = `${this.wrapper.offsetHeight / 2}px`;


    }

    addData(options) {
        const switcher = document.createElement('div');
        switcher.className = 'switcher';

        // иконка свитча
        const icon = document.createElement('div');
        icon.className = 'switcher__icon';
        icon.style.backgroundImage = `url('${options.icon}')`;
        switcher.appendChild(icon);

        // тайтл свитча
        const title = document.createElement('p');
        title.className = 'switcher__title';
        title.textContent = options.title;
        switcher.appendChild(title);

        const points = this.createPointsLayer(options.icon, options.points);

        this.data.push({
            switcher,
            points
        });

        const idx = this.data.length - 1;
        switcher.onclick = () => {
            if(this.currentIndex !== idx) {
                this.setSwitcher(idx);
            }
        }

        this.switchersWrapper.appendChild(switcher);
    }

    createPointsLayer(icon = '', points) {
        const layer = new PIXI.Container();
        layer.alpha = 0;
        const texture = PIXI.Texture.from(icon);

        points.forEach(point => {
            const sprite = new PIXI.Sprite(texture);
            sprite.width = 23;
            sprite.height = 23;
            sprite.anchor.set(0.5);
            sprite.setTransform(point.x, point.y);
            layer.addChild(sprite);
        });
        this.scheme.addChild(layer);
        return layer;
    }

    setSwitcher(idx) {
        if(this.currentIndex !== null) {
            this.data[this.currentIndex].points.alpha = 0;
            //this.data[this.currentIndex].points.classList.remove('active');
            this.data[this.currentIndex].switcher.classList.remove('active');
        }

        if(this.data[idx].points) {
            this.data[idx].points.alpha = 1;
            this.data[idx].switcher.classList.add('active');
        }

        this.currentIndex = idx;
    }
}
let data = {
    lang: 'ru',
    data: [
        {
            "title": "Стойки информации",
            "icon": standIcon,
            "points": [
                {
                    "x": 1709.4000854492,
                    "y": 914.9000244141
                },
                {
                    "x": 1428.0000610352,
                    "y": 1659.6000366211
                },
                {
                    "x": 948,
                    "y": 1945.0999755859
                },
                {
                    "x": 674.799987793,
                    "y": 1079.8000488281
                },
                {
                    "x": 1428.200012207,
                    "y": 1559.700012207
                },
                {
                    "x": 711.4000244141,
                    "y": 1427.200012207
                },
                {
                    "x": 1031.6000366211,
                    "y": 1327.200012207
                },
                {
                    "x": 1338.6000366211,
                    "y": 1327.5000610352
                },
                {
                    "x": 1244.4000854492,
                    "y": 1327.6000366211
                },
                {
                    "x": 975,
                    "y": 1289.1000366211
                },
                {
                    "x": 1229.4000854492,
                    "y": 1353.8001098633
                },
                {
                    "x": 1441.700012207,
                    "y": 1153.1000366211
                },
                {
                    "x": 1542.5000610352,
                    "y": 1102.5000610352
                },
                {
                    "x": 1611.5000610352,
                    "y": 1256.6000366211
                },
                {
                    "x": 1584.6000366211,
                    "y": 1407.0000610352
                },
                {
                    "x": 1462.200012207,
                    "y": 1279.1000366211
                },
                {
                    "x": 1099.5000610352,
                    "y": 1420.6000366211
                },
                {
                    "x": 1124.9000854492,
                    "y": 1113.700012207
                },
                {
                    "x": 1091.9000854492,
                    "y": 1192.9000854492
                },
                {
                    "x": 1257.6000366211,
                    "y": 1193.0000610352
                },
                {
                    "x": 1404.8001098633,
                    "y": 1198.6000366211
                },
                {
                    "x": 1601.5000610352,
                    "y": 1424.200012207
                },
                {
                    "x": 1458.4000854492,
                    "y": 1136.5000610352
                },
                {
                    "x": 1632.4000854492,
                    "y": 1256.6000366211
                },
                {
                    "x": 976.5999755859,
                    "y": 1554.3000488281
                },
                {
                    "x": 889.4000244141,
                    "y": 1426.8000488281
                },
                {
                    "x": 863.299987793,
                    "y": 1360.3000488281
                }
            ]
        },
        {
            "title": "Сувенирная продукция",
            "icon": shopIcon,
            "points": [
                {
                    "x": 1709.4000854492,
                    "y": 914.9000244141
                },
                {
                    "x": 1428.0000610352,
                    "y": 1659.6000366211
                },
                {
                    "x": 948,
                    "y": 1945.0999755859
                },
                {
                    "x": 674.799987793,
                    "y": 1079.8000488281
                },
                {
                    "x": 1428.200012207,
                    "y": 1559.700012207
                },
                {
                    "x": 711.4000244141,
                    "y": 1427.200012207
                },
                {
                    "x": 1031.6000366211,
                    "y": 1327.200012207
                },
                {
                    "x": 1338.6000366211,
                    "y": 1327.5000610352
                },
                {
                    "x": 1244.4000854492,
                    "y": 1327.6000366211
                },
                {
                    "x": 975,
                    "y": 1289.1000366211
                },
                {
                    "x": 1229.4000854492,
                    "y": 1353.8001098633
                },
                {
                    "x": 1441.700012207,
                    "y": 1153.1000366211
                },
                {
                    "x": 1542.5000610352,
                    "y": 1102.5000610352
                },
                {
                    "x": 1611.5000610352,
                    "y": 1256.6000366211
                },
                {
                    "x": 1584.6000366211,
                    "y": 1407.0000610352
                },
                {
                    "x": 1462.200012207,
                    "y": 1279.1000366211
                },
                {
                    "x": 1099.5000610352,
                    "y": 1420.6000366211
                },
                {
                    "x": 1124.9000854492,
                    "y": 1113.700012207
                },
                {
                    "x": 1091.9000854492,
                    "y": 1192.9000854492
                },
                {
                    "x": 1257.6000366211,
                    "y": 1193.0000610352
                },
                {
                    "x": 1404.8001098633,
                    "y": 1198.6000366211
                },
                {
                    "x": 1601.5000610352,
                    "y": 1424.200012207
                },
                {
                    "x": 1458.4000854492,
                    "y": 1136.5000610352
                },
                {
                    "x": 1632.4000854492,
                    "y": 1256.6000366211
                },
                {
                    "x": 889.4000244141,
                    "y": 1426.8000488281
                }
            ]
        }
    ]
}

new Widget(document.getElementById('root'), data);