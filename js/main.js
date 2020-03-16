// setting up a glogal channel
const eventBus = new Vue()

// Component for product-details
Vue.component('product-details', {
     props: {
          details: {
               type: Array,
               required: true
          },
     },
     template: `
     <ul>
          <li v-for="detail in details">{{ detail }}</li>
     </ul>
     `
})

// Component for product-review form
Vue.component('product-review', {

     template: `
               <form class="review-form" @submit.prevent="onSubmit">
               <p v-if="errors.length">
                    <b>Please correct the following error(s):</b>
                    <ul>
                         <li v-for="error in errors">{{ error }}</li>
                    </ul>
               </P>

               <p>
               <label for="name">Name:</label>
               <input id="name" v-model="name" placeholder="name">
               </p>
               
               <p>
               <label for="review">Review:</label>    
               <!--- defult html 5 error checking with "required" tag, but here we make custom --->  
               <textarea id="review" v-model="review"></textarea>
               </p>
               
               <p>
               <label for="rating">Rating:</label>
               <select id="rating" v-model.number="rating">
               <option>5</option>
               <option>4</option>
               <option>3</option>
               <option>2</option>
               <option>1</option>
               </select>
               </p>
               
               <p>
               <input type="submit" value="Submit">  
               </p>    
          
          </form>
     `,
     data() {
          return {
               name: null,
               review: null,
               rating: null,
               errors: []
          }
     },
     methods: {
          onSubmit() {
               if (this.name && this.review && this.rating) {
                    let productReview = {
                         name: this.name,
                         review: this.review,
                         rating: this.rating
                    }
                    // send to parent
                    eventBus.$emit('review-submitted', productReview)
                    this.name = null
                    this.review = null
                    this.rating = null
               }
               else {
                    if (!this.name) this.errors.push("Name required.")
                    if (!this.review) this.errors.push("Review required.")
                    if (!this.rating) this.errors.push("Rating required.")
               }
          }
     }
})

// Tabs component
Vue.component('product-tabs', {
     props: {
          reviews: {
               type: Array,
               required: true,
          }
     },
     template: `
          <div>
               <span class="tab"
                    :class="{ activeTab: selectedTab === tab}"
                    v-for="(tab, index) in tabs"
                    :key="index"
                    @click="selectedTab = tab">
                    {{ tab }}</span>

               <div v-show="selectedTab === 'Reviews'">
                    <h2>Reviews</h2>
                    <p v-if="!reviews.length">There are no reviews yet.</p>
                    <ul>
                         <li v-for="review in reviews">
                         <p>{{ review.name }}</p>
                         <p>{{ review.rating }}</p>
                         <p>{{ review.review }}</p>
                         </li>
                    </ul>
               </div>
               <product-review v-show="selectedTab === 'Make a Review'"></product-review>
          </div>
     `,
     data() {
          return {
               tabs: ['Reviews', 'Make a Review'],
               selectedTab: 'Reviews'
          }
     }
})


// Main product component
Vue.component('product', {
     props: {
          premium: {
               type: Boolean,
               required: true
          },
          cart: {
               type: Array,
               required: true,
          }
     },
     template: ` <div class="product">
                    <div class="product-image">
                         <img :src="image" :alt="altText">
                    </div>
                    <div class="product-info">
                         <!-- computable propertiy -->
                         <h1>{{ title }}</h1>
                         <h3>{{ sale }}</h3>
                         <p>{{ describtion }}</p>
                         <!-- <p v-if="inStock">In Stock</p> v-if removes the data and element from the dome, if you want to only hide the elemet then v-show (performace wise better.) -->
                         <p v-if="inStock">In Stock</p>
                         <p v-else-if="inStock<= 10 && inStock > 0">Almost out of Stock</p>
                         <p v-else="OutofStock" :class="{ OutofStock: !inStock || inStock == 0}">Out of Stock</p>
                         <p>Shipping: {{ Shipping }}</p>
                         <a :href="linkedText" target="_blank">A link!</a>

                         <product-details :details="details"></product-details>

                         <!-- Each items identity for Vue can keep track of each node’s identity -->
                         <div class="color-box" v-for="(variant, index) in variants" :key="variant.variantId"
                              :style="{backgroundColor: variant.variantColor }" @mouseover="updateProduct(index)">
                         </div>

                         <button v-on:click="addToCart" :disabled="!inStock"
                                        :class="{ disabledButton: !inStock}">Add to Cart</button>
                         <button @click="removeFromCart" :disabled="cart <= 0"
                                        :class="{ disabledButton: cart <= 0}">Remove from Cart</button>
                    </div>

               <product-tabs :reviews="reviews"></product-tabs>
               
          </div>
     `,
     data() {
          return {
               brand: 'Vue Mastery',
               product: 'Socks',
               onSale: true,
               describtion: 'A pair of warm, fuzzy socks',
               selectedVariant: 0,
               altText: 'A pair of socks',
               linkedText: webLink,
               details: ["80% cotton", "20% polyester", "Gender-neutral"],
               variants: [
                    {
                         variantId: 2234,
                         variantColor: "green",
                         variantImage: './images/vmSocks-green-onWhite.jpg',
                         variantQuantity: 13,
                    },
                    {
                         variantId: 2235,
                         variantColor: "blue",
                         variantImage: 'https://www.vuemastery.com/images/challenges/vmSocks-blue-onWhite.jpg',
                         variantQuantity: 0,
                    }
               ],
               reviews: []
          }
     },

     methods: {
          addToCart: function () {
               this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId)
          },
          // This is the ESO6 shorthand for funstions, not supported by shit browsers.
          updateProduct(index) {
               this.selectedVariant = index
          },
          removeFromCart() {
               this.$emit('remove-from-cart', this.variants[this.selectedVariant].variantId)
          },
     },
     // more effiecnt then a method, these values are always cached, good rule is not to change data values here.
     computed: {
          title() {
               return this.brand + " " + this.product
          },
          image() {
               // We are grabing the current variant, then the index of it, then that indexed variants image
               return this.variants[this.selectedVariant].variantImage
          },
          inStock() {
               return this.variants[this.selectedVariant].variantQuantity
          },
          sale() {
               if (this.onSale) {
                    return this.brand + " " + this.product + ' are on sale!'
               }
               return this.brand + " " + this.product + ' are not on sale!'
          },
          Shipping() {
               if (this.premium) {
                    return "Free!"
               }
               return 2.99 + ' CAD'
          },
          // life cycle hook
          mounted() {
               eventBus.$on('review-submitted', productReview => {
                    this.reviews.push(productReview)
               })
          }
     },
})


const webLink = 'https://developercommunity.visualstudio.com/content/problem/83144/visual-studio-for-mac-repeatedly-crashing.html'
let app = new Vue({
     el: '#app',
     data: {
          premium: true,
          cart: [],
     },
     methods: {
          addMainCart(id) {
               this.cart.push(id)
          },
          removeMainCart(id) {
               this.cart.pop(id)
          }
     },
});