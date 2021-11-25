const { Novus } = require('../utilities/novus.js')
const timeout = 80000
const { phone, password } = require('../utilities/cred.js')

describe(
    'Testing incorrect login functionality:',
    () => {
        let novus = new Novus()
        let loginPage;

        beforeAll(
            async () => {
                try {
                    loginPage = await novus.startTest('https://novus.zakaz.ua/uk/')
                }
                catch (error) {
                    console.log(error);
                    throw error;
                }
            }, timeout
        );

        it("Typed phone number in a wrong format",
            async () => {
                await reporter.description("Testing login functionality")

                await reporter.startStep("Enter wrong phone number and password")
                await loginPage.loginForValidation('vvvvv', '1234')
                await reporter.endStep()

                await reporter.startStep("Check classes of the email input element")
                const inputEmailClasses = await loginPage.validateLogin()
                await reporter.endStep()
                
                expect(inputEmailClasses).toContain('login__field--wrong')

            }, timeout
        );

        afterAll(
            async () => {
                await novus.endTest()
            }
        );
    }, timeout
);


describe(
    'Testing site functionality:',
    () => {
        let novus = new Novus()
        let loginPage;
        let mainPage;
        let searchPage;

        beforeAll(
            async () => {
                try {
                    loginPage = await novus.startTest('https://novus.zakaz.ua/uk/')
                    mainPage = await loginPage.loginForFurtherTesting(phone, password)
                }
                catch (error) {
                    console.log(error);
                    throw error;
                }
            }, timeout
        );

        it("If products are filtered by trademark properly",
            async () => {
                await reporter.description("Check the filter functionality (trademark)")

                await reporter.startStep("Search certain category")
                searchPage = await mainPage.searchProductsInCateg('Молочне і яйця')
                await reporter.endStep()

                await reporter.startStep("Filter by trademark")
                const productTitle = await searchPage.filterProductsInCateg('lactel')
                await reporter.endStep()

                expect(productTitle).toContain('Lactel')
            }, timeout
        );

        it("If products are filtered by fat content properly",
            async () => {
                await reporter.description("Check the filter functionality (fat content)")

                await reporter.startStep("Filter by fat content")
                const productTitle = await searchPage.filterProductsInCateg('1-5')
                await reporter.endStep()

                expect(productTitle).toMatch(new RegExp('1.5%'))
            }, timeout
        );

        it("If products are ordered in descending order properly",
            async () => {
                await reporter.description("Check order functionality")

                await reporter.startStep("Order by price in descending order")
                const productPrices = await searchPage.orderByPrice()
                await reporter.endStep()

                expect(parseFloat(productPrices[0])).toBeGreaterThanOrEqual(parseFloat(productPrices[1]))
            }, timeout
        );

        
        it("If product is correctly added to a wish list",
            async () => {
                await reporter.description("Check adding to the wishlist functionality")
                
                await reporter.startStep("Add product to the wishlist")
                const listPage = await searchPage.addProductToWishList()
                await reporter.endStep()

                await reporter.startStep("Check product availability in the wishlist")
                const addedProduct = await listPage.checkWishList()
                await reporter.endStep()

                expect(addedProduct).toBeDefined()
            }, timeout
        );

        afterAll(
            async () => {
                await novus.endTest()
            }
        );
    }, timeout
);
