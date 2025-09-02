import React from 'react'
// import LoadingImageSvg from './loading-image-svg'
import Image from 'next/image'

export default function CardLoading({ loading = true }) {
  return (
    <>
      <div className="col">
        <div className="card h-100" aria-hidden="true">
          <Image
            className="card-img-top"
            src={
              loading ? '/images/cat/c1-loading.webp' : '/images/cat/c1.webp'
            }
            alt="..."
            width={300}
            height={188}
            style={{ width: '100%', height: 'auto' }} // optional
          />

          <div className="card-body">
            <h5 className="card-title placeholder-glow">
              {loading ? (
                <span className="placeholder col-4"></span>
              ) : (
                'Card Title'
              )}
            </h5>

            {loading ? (
              <p className="card-text placeholder-glow">
                <span className="placeholder col-7"></span>
                <span className="placeholder col-4"></span>
                <span className="placeholder col-4"></span>
                <span className="placeholder col-6"></span>
                <span className="placeholder col-8"></span>
              </p>
            ) : (
              <p className="card-text">
                Some quick example text to build on the card title and make up
                the bulk of the card&apos;s content.
              </p>
            )}

            {loading ? (
              <a
                href="#/"
                className="btn btn-primary disabled placeholder col-6"
                aria-disabled="true"
              >
                &nbsp;
              </a>
            ) : (
              <a href="#" className="btn btn-primary">
                Go somewhere
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
