import Image from "next/image"
import Link from "next/link"
import {
  AiOutlineMinus,
  AiOutlinePlus,
  AiOutlineLeft,
  AiOutlineShopping,
} from "react-icons/ai"
import { TiDeleteOutline } from "react-icons/ti"
import toast from "react-hot-toast"
import getStripe from "@/lib/getStripe"
import { useShoppingCartContext } from "@/context/ShoppingCartContext"
import { CartItem } from "@/types"
import { getImageUrl } from "@/lib/getImageUrl"

const Cart = () => {
  const {
    totalPrice,
    totalQuantities,
    cartItems,
    setShowCart,
    toggleCartItemQuantity,
    onRemove,
  } = useShoppingCartContext()

  async function handleCheckout() {
    const stripe = await getStripe()

    const response = await fetch("/api/stripe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cartItems),
    })

    if (response.status === 500) return

    const data = await response.json()

    toast.loading("Redirecting...")

    stripe?.redirectToCheckout({ sessionId: data.id })
  }

  return (
    <div className="cart-wrapper">
      <div className="cart-container">
        <button
          type="button"
          className="cart-heading"
          onClick={() => setShowCart(false)}
        >
          <AiOutlineLeft />
          <span className="heading">Your Cart</span>
          <span className="cart-num-items">({totalQuantities} items)</span>
        </button>

        {cartItems.length < 1 && (
          <div className="empty-cart">
            <AiOutlineShopping size={150} />
            <h3>Your shopping bag is empty</h3>
            <Link href="/">
              <button
                type="button"
                onClick={() => setShowCart(false)}
                className="btn"
              >
                Continue Shopping
              </button>
            </Link>
          </div>
        )}

        <div className="product-container">
          {cartItems.length >= 1 &&
            cartItems.map((item: CartItem) => (
              <div className="product" key={item._id}>
                <Image
                  src={getImageUrl(item?.image[0])}
                  alt={item.name}
                  width={300}
                  height={300}
                  className="cart-product-image"
                />
                <div className="item-desc flex flex-col gap-6">
                  <div className="">
                    <h5 className="text-xl font-bold">{item.name}</h5>
                    <h4 className="text-lg font-semibold font-gray">
                      ${item.price}
                    </h4>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <p className="quantity-desc flex items-center justify-between">
                        <span
                          className="minus"
                          onClick={() =>
                            toggleCartItemQuantity(item._id, "dec")
                          }
                        >
                          <AiOutlineMinus />
                        </span>
                        <span className="">{item.quantity}</span>
                        <span
                          className="plus border-l border-black"
                          onClick={() =>
                            toggleCartItemQuantity(item._id, "inc")
                          }
                        >
                          <AiOutlinePlus />
                        </span>
                      </p>
                    </div>
                    <button
                      title="cart"
                      type="button"
                      className="remove-item"
                      onClick={() => onRemove(item)}
                    >
                      <TiDeleteOutline />
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {cartItems.length >= 1 && (
          <div className="cart-bottom">
            <div className="total">
              <h3>Subtotal:</h3>
              <h3>${totalPrice}</h3>
            </div>
            <div className="btn-container">
              <button
                type="button"
                title="cart"
                className="btn"
                onClick={handleCheckout}
              >
                Pay with Stripe
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart
