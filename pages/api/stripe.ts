import type { NextApiRequest, NextApiResponse } from "next"
import { Stripe } from "stripe"

type Image = {
  asset: { _ref: string }
  _key: string
}

type Slug = {
  current: string
}

type Product = {
  image: Image[]
  name: string
  slug: Slug
  price: number
  quantity: number
  details: string
  _id: number
}

// const stripe = require("stripe")(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY)

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY || "", {
  apiVersion: "2020-08-27",
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const cartItems = req.body
    try {
      // Create Checkout Sessions from body params.
      const params = {
        submit_type: "pay",
        mode: "payment",
        payment_method_types: ["card"],
        billing_address_collection: "auto",
        shipping_options: [
          { shipping_rate: "shr_1MlGwlHMBqdtOZFdHOK75zt2" },
          { shipping_rate: "shr_1MlGx8HMBqdtOZFdVxTSZxYQ" },
        ],
        line_items: req.body.map((item: Product) => {
          const img = item.image[0].asset._ref
          const newImage = img
            .replace(
              "image-",
              "https://cdn.sanity.io/images/vfxfwnaw/production/"
            )
            .replace("-webp", ".webp")

          return {
            price_data: {
              currency: "usd",
              product_data: {
                name: item.name,
                images: [newImage],
              },
              unit_amount: item.price * 100,
            },
            adjustable_quantity: {
              enabled: true,
              minimum: 1,
            },
            quantity: item.quantity,
          }
        }),
        success_url: `${req.headers.origin}/success`,
        cancel_url: `${req.headers.origin}/canceled`,
      }
      // Create Checkout Sessions from body params.
      const session = await stripe.checkout.sessions.create(params)

      console.log(session)
      res.status(200).json(session)
    } catch (err: any) {
      res.status(err.statusCode || 500).json(err.message)
    }
  } else {
    res.setHeader("Allow", "POST")
    res.status(405).end("Method Not Allowed")
  }
}