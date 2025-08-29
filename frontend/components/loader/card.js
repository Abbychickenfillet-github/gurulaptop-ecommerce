import React from 'react'
import Image from 'next/image'
import Card from 'react-bootstrap/Card';


export default function CardLoader() {
  return (
    <>
      <div className="card" aria-hidden="true">
        <Image
          width={300}
          height={180}
          src="/images/cat/c1.webp"
          className="card-img-top"
          alt="..."
        />
        <div className="card-body">
          <h5 className="card-title placeholder-glow">Card title</h5>
          <p className="card-text">
            Some quick example text to build on the card title and make up the
            bulk of the card's content.
          </p>
          <a href="#" className="btn btn-primary">
            Go somewhere
          </a>
        </div>
      </div>
    </>
  )
}
