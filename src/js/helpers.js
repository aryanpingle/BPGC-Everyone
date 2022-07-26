export const print = console.log
export const lerp = (val,lb,ub,lv,uv)=>lv + (val-lb)*(uv-lv)/(ub-lb)

/**
 * Returns the arithmetic sum of all elements in the array
 * @param {Iterable} iterable The array to be operated on
 * @param {Function} key Function that converts each element of the array into an addable value
 * @returns {Number}
 */
export const summation = (iterable, key = e => e) => {
    let sum = 0
    for(let i = 0; i < iterable.length; ++i) {
        sum += key(iterable[i])
    }
    return sum
}

/**
 * 
 * @param {*} arr 
 * @param {*} key 
 * @returns 
 */
export const sort_numbers = (arr, key=e=>e) => {
    arr.sort((a,b) => key(a)-key(b))
}

/**
 * Sorts an array in-place
 * @param {Iterable} arr The array to be sorted
 * @param {Function} hash_function A function that converts each element of the array into a unique ID
 * @param {Function} key A function that maps an element of the array into a string that is sorted by
 * @returns {void}
 */
export const sort_strings = (arr, hash_function, key) => {
    // Kinda complicated, but way better for performance than arr.sort((a,b) => key(a).localeCompare(key(b)))
    // The previous code would call key() during the sorting technique, so definitely more than N times
    // This stacks up for complicated key() functions
    // Instead, we'll precompute key() for every element. It can be accessed through the element's hashmap

    // hash_to_key is a hashmap that maps a hash to the key() result for every element
    let hash_to_key = {}
    // Create the hashmap
    for(let i = 0; i < arr.length; ++i) {
        hash_to_key[hash_function(arr[i])] = key(arr[i])
    }

    arr.sort((a,b) => {
        return hash_to_key[hash_function(a)].localeCompare(hash_to_key[hash_function(b)])
    })
}

export const sort_multiple = (arr, key=e=>e) => {
    arr.sort((a,b) => {
        a = key(a)
        b = key(b)
        let score = 0
        for(let i = 0; i < a.length; ++i) {
            score = a[i] - b[i]
            if(score != 0) return score
        }
        return 0
    })
    return arr
}
export const max = (iterable, key=e=>e)=>iterable.reduce((acc,val)=>key(acc)>key(val)?acc:val, iterable[0])
export const min = (iterable, key=e=>e)=>iterable.reduce((acc,val)=>key(acc)<key(val)?acc:val, iterable[0])
export const gid = id=>document.getElementById(id)
export const logtime = (stime, process, color="greenyellow")=>print(`%c${process}%c completed in %c${new Date()-stime}ms%c`, "background-color: white; color: black; font-weight: 700;", "", `color: ${color};`, "")
export function formattedNumber(number) {
    if(number == 0) return number
    let string = ""
    let counter = 0
    while(number != 0) {
        if(counter != 0 && counter % 3 == 0) string = number % 10 + "," + string
        else string = number % 10 + string
        number = Math.floor(number / 10)
        ++counter
    }
    return string
}

/**
 * Returns the results of document.querySelectorAll as an array
 * @param  {...any} params 
 * @returns {HTMLElement[]}
 */

export function querySelectorAll(selector, target) {
    return [...(target || document).querySelectorAll(selector)]
}

export function vibrate(ms) {
    if("vibrate" in navigator) {
        navigator.vibrate(ms)
    }
}

/**
 * Asynchronously loads the Inconsolata font, then adds a `font-loaded` class to HTML document
 */

export async function setupFontLoad() {
    // Wait till the service worker is ready
    if("serviceWorker" in navigator && "ready" in navigator.serviceWorker) {
        await navigator.serviceWorker.ready
    }

    await fetch("./static/fonts/Inconsolata.woff2")
    
    // After the font loads, add the CSS font family to document.head
    let css = "<style>"
    for(const weight of [100, 200, 300, 400, 500, 600, 700, 800, 900]) {
        css += `
        @font-face {
            font-family: 'Inconsolata';
            font-style: normal;
            font-display: swap;
            font-weight: ${weight};
            src: url(./static/fonts/Inconsolata.woff2) format('woff2'),
                url(./static/fonts/Inconsolata.woff) format('woff');
        }
        `.trim().replace(/\n\s*/g, "")
    }
    css += "</style>"

    document.head.innerHTML += css
    
    document.documentElement.classList.add("font-loaded")
}