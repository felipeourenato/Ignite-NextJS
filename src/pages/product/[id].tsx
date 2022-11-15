import { GetStaticPaths, GetStaticProps } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { stripe } from "../../lib/stripe";
import Stripe from "stripe";

import axios from "axios";

import {
  ImageContainer,
  ProductContainer,
  ProductDeatils,
} from "../../styles/pages/product";

interface ProductProps {
  product: {
    id: string;
    name: string;
    imageUrl: string;
    price: string;
    description: string;
    defaultPriceId: string;
  };
}

export default function Product({
  product: { name, imageUrl, price, description, defaultPriceId },
}: ProductProps) {
  const { isFallback } = useRouter();
  if (isFallback) {
    return <p>Loading...</p>;
  }

  async function handleBuyProduct() {
    try {
      const {
        data: { checkoutUrl },
      } = await axios.post("/api/checkout", {
        priceId: defaultPriceId,
      });

      window.location.href = checkoutUrl;
    } catch (err) {
      alert(err);
    }
  }

  return (
    <ProductContainer>
      <ImageContainer>
        <Image src={imageUrl} alt="" width={520} height={480} />
      </ImageContainer>

      <ProductDeatils>
        <h1>{name}</h1>
        <span>{price}</span>

        <p>{description}</p>

        <button onClick={handleBuyProduct}>Comprar Agora</button>
      </ProductDeatils>
    </ProductContainer>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [
      {
        params: { id: "prod_Mo2Epbw86KwIO5" },
      },
    ],
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps<any, { id: string }> = async ({
  params,
}) => {
  const productId = params!.id;

  const product = await stripe.products.retrieve(productId, {
    expand: ["default_price"],
  });

  const price = product.default_price as Stripe.Price;

  return {
    props: {
      product: {
        ...product,
        imageUrl: product.images[0],
        price: new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(price.unit_amount! / 100),
        defaultPriceId: price.id,
      },
    },
    revalidate: 60 * 60 * 1,
  };
};
