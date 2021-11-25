const puppeteer  = require('puppeteer')

class Novus {
    async startTest(url) {
        const width = 1600;
        const height = 960;
        this.browser = await puppeteer.launch({
            headless: false,
            slowMo: 5,
            'defaultViewport' : { 'width' : width, 'height' : height },
        });
        let page = await this.browser.newPage();
        page.setDefaultTimeout(1000 * 60 * 5);
        await page.setViewport( { 'width' : width, 'height' : height } );
        await page.setUserAgent( 'UA-TEST' );
        await page.goto(url);
        return this.loginPage(page, { 'waitUntil' : 'domcontentloaded' } )
    }
    async loginPage(novusPage) {
        async function signIn(phone, password) {
            await novusPage.click('[data-marker="Sign in"]')
                await novusPage.waitForSelector('input[id=login-data]', { visible: true });
                await novusPage.type('input[id=login-data]', phone, { delay: 100 })
                await novusPage.waitForSelector('input[id=login-password]');
                await novusPage.type('input[id=login-password]', password, { delay: 100 })
                await novusPage.click('button[type=submit][data-marker="Sign in"]')
                await novusPage.waitFor(5000)
        }
        return {
            loginForValidation: async (phone, password) => {
                await signIn(phone, password)    
            },
            loginForFurtherTesting: async (phone, password) => {
                await signIn(phone, password)
                return this.mainPage(novusPage)
            },
            validateLogin: async () => {
                await novusPage.waitForSelector('input[id=login-data]')
                const inputEmailClasses = await novusPage.evaluate( input => [...input.classList], 
                    await novusPage.$('input[id=login-data]'))
                await novusPage.click('button[type=button][data-testid="GeneralModal__close"]')
                return inputEmailClasses
            },
        }
    }

    async mainPage(novusPage) {
        return {
            searchProductsInCateg: async(category) => {
                await novusPage.waitForSelector('div[data-marker="First Level Categories Menu"]')
                await novusPage.hover(`li[title="${category}"]`)
                await novusPage.click(`li[title="${category}"]`)
                await novusPage.waitForSelector('.categories-box__list')
                await novusPage.waitForSelector('.category-card')
                await novusPage.click('.category-card')
                await novusPage.waitFor(3000)
                return this.searchPage(novusPage)
            },
        }
    }

    async searchPage(novusPage) {
        return {
            filterProductsInCateg: async(filterProp) => {
                await novusPage.waitForSelector('.catalog-filters')
                await novusPage.click(`input[type=checkbox][name="${filterProp}"]`)
                await novusPage.waitForSelector('[data-testid=product_tile_title]')
                await novusPage.waitFor(3000)

                const productTitle = await novusPage.evaluate(() => 
                    document.querySelector('[data-testid="product_tile_title"]').innerHTML)
                await novusPage.click(`input[type=checkbox][name="${filterProp}"]`)
                await novusPage.waitForSelector(`input[type=checkbox][name="${filterProp}"][data-status="inactive"]`)
                await novusPage.waitFor(3000)
                return productTitle
            },

            orderByPrice: async () => {
                await novusPage.waitForSelector('[data-marker="Content sorter"]')
                await novusPage.click('button[type=button][data-marker="price_desc"]')
                await novusPage.waitForSelector('[data-testid="product-tile"]')
                await novusPage.waitForSelector('.Price__value_caption')

                const productPrices = await novusPage.evaluate(() => 
                    Array.from(document.querySelectorAll('.Price__value_caption').values())
                        .map(el => el.innerHTML))

                await novusPage.waitFor(3000)
                return productPrices
            },

            addProductToWishList: async () => {
                await novusPage.waitForSelector('[data-marker="Add product to list"]')
                await novusPage.click('[data-marker="Add product to list"]')
                await novusPage.waitForSelector('.add-to-list-modal')
                await novusPage.waitFor(3000)
                await novusPage.click('[data-marker="Save"]')
                await novusPage.waitFor(3000)
                return this.listPage(novusPage)
            }
        }
    }

    async listPage(novusPage) {
        return {
            checkWishList: async () => {
                await novusPage.waitForSelector('.header-bottom-line__info-menu-link')
                const wishListLink = await novusPage.evaluate(() => 
                    Array.from(document.querySelectorAll('.header-bottom-line__info-menu-link').values())
                        .map(el => el.href))


                await novusPage.goto(wishListLink[1])
                await novusPage.waitFor(3000)
                await novusPage.waitForSelector('[data-testid="product-tile"]')
                const addedProduct = await novusPage.evaluate( el =>
                    el, '[data-testid="product-tile"]') 
                return addedProduct
            }
        }
    }

    async endTest() {
        await this.browser.close();
    }

}


module.exports.Novus = Novus