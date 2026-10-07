const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const defaultHbs = fs.readFileSync(path.join(root, 'default.hbs'), 'utf8')
const indexHbs = fs.readFileSync(path.join(root, 'index.hbs'), 'utf8')

test('default.hbs loads map dependencies in <head> before body content', () => {
    const headEnd = defaultHbs.indexOf('</head>')
    const bodyStart = defaultHbs.indexOf('<body')
    assert.ok(headEnd > -1, 'expected </head>')
    assert.ok(bodyStart > headEnd, 'expected <body> after </head>')

    const head = defaultHbs.slice(0, headEnd)
    assert.match(
        head,
        /cdnjs\.cloudflare\.com\/ajax\/libs\/leaflet\/1\.7\.1\/leaflet\.js/,
    )
    assert.match(
        head,
        /cdnjs\.cloudflare\.com\/ajax\/libs\/leaflet\.draw\/1\.0\.4\/leaflet\.draw\.js/,
    )
    assert.match(
        head,
        /leaflet\.markercluster\/1\.4\.1\/MarkerCluster\.Default\.css/,
    )
    assert.match(head, /leaflet\.fullscreen\.css/)
    assert.match(head, /font-awesome\/5\.15\.1\/css\/all\.min\.css/)
    assert.match(
        head,
        /leaflet\.locatecontrol@0\.72\.0\/dist\/L\.Control\.Locate\.min\.css/,
    )
    assert.match(head, /maps\.wanderstories\.space\/main\.js\?v=/)
    assert.match(head, /__wsMakeMapQueue/)
    assert.match(head, /window\.makeMap\s*=\s*window\.makeMap\s*\|\|/)
})

test('map scripts are scoped to home and post (where makeMap is used)', () => {
    assert.match(defaultHbs, /\{\{#is\s+"home,\s*post"\}\}/)
})

test('index.hbs does not call makeMap before it is a function', () => {
    assert.match(indexHbs, /typeof makeMap !== 'function'/)
    assert.match(indexHbs, /makeMap\(mapOptions\)/)
})

test('map script tags disable Cloudflare Rocket Loader', () => {
    const head = defaultHbs.slice(0, defaultHbs.indexOf('</head>'))
    const mapScripts =
        head.match(/<script[^>]+maps\.wanderstories\.space\/main\.js[^>]*>/g) ||
        []
    assert.equal(mapScripts.length, 1)
    assert.match(mapScripts[0], /data-cfasync="false"/)
})
