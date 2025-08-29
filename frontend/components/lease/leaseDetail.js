import React, { useState, useEffect } from 'react';
import styles from '@/styles/lease.module.css';
import BackToTop from '../BackToTop/BackToTop'
import Image from 'next/image'

export default function LeaseDetail(props) {
  return (
    <div className={styles.customContainer}>
      <section className={styles.col1}>
        <div className={styles.menu}>
          <div className={styles.square}>
            <Image
              src="/images/lease/15-fd1149TU.png"
              alt="Alienware"
            />
            <div className={`${styles.carouselBtn} ${styles.leftBtn}`}>
              <Image src="/images/lease/array_left.svg" alt="Previous" />
            </div>
            <div className={`${styles.carouselBtn} ${styles.rightBtn}`}>
              <Image src="/images/lease/array_right.svg" alt="Next" />
            </div>
          </div>
          <div className={styles.menu2}>
            <div className={styles.list}>
              <Image
                src="/images/lease/Alienware m16 R2.png"
                alt="AORUS 16"
              />
            </div>
            <div className={styles.list}>
              <Image
                src="/images/lease/AORUS 5 (Intel 12th Gen).png"
                alt="ASUS Vivobook"
              />
            </div>
            <div className={styles.list}>
              <Image
                src="/images/lease/AORUS 5 (Intel 12th Gen).png"
                alt="G634JZ Model"
              />
            </div>
          </div>
        </div>

        <div className={styles.productInfo}>
          <div className={styles.productInfo2}>
            <div className={styles.brand}>
              <span>ASUS</span>
              <div className={styles.icon}>
                <Image className={styles.cart} src="/images/lease/cart.svg" alt="Cart" />
                <Image
                  className={styles.heart}
                  src="/images/lease/heart.svg"
                  alt="Favorite"
                />
              </div>
            </div>

            <span className={styles.title}>
              華碩 Zephyrus Duo 16吋電競筆電黑色
            </span>

            <div className={styles.project}>
              <div className={styles.project2}>
                <span className={styles.price}>$50,000</span>
                <span className={styles.originalPrice}>$60,000</span>
              </div>
              <span className={styles.num}>商品數量：10</span>
            </div>

            <div className={styles.quantityContainer}>
              <div className={styles.quantity}>
                <span className={styles.quantityLabel}>Quantity</span>
                <div className={styles.quantitySelector}>
                  <select id="quantity" className={styles.quantityInput}>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                  </select>
                </div>
              </div>
              <div className={styles.quantity}>
                <span className={styles.quantityLabel}>天數</span>
                <div className={styles.quantitySelector}>
                  <select id="days" className={styles.quantityInput}>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                  </select>
                </div>
              </div>
            </div>

            <div className={styles.buttonContainer}>
              <button className={styles.rentButton}>租賃</button>
              <div className={styles.articleCheckbox}>
                <input type="checkbox" id="customCheck" />
                <label htmlFor="customCheck">&nbsp;&nbsp;加入比較</label>
              </div>
            </div>

            <div className={styles.description}>
              <p>
                16&quot; Mini LED WQXGA(2560x1600),16:10,240Hz,3ms,DCI-P3
                100%；副螢幕：14&quot; IPS ScreenPad Plus (3840x1100)4K
              </p>
              <p>AMD Ryzen 9 7945HX (2.5GHz up to 5.4GHz,64MB)16 Cores</p>
              <p>64GB(32GB*2) DDR5-4800 SO-DIMM (2Slot,Max.64GB)</p>
              <p>硬碟: 2TB+2TB PCIe 4.0 NVMe M.2 SSD (RAID 0)</p>
              <p>作業系統: Windows 11 Home</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.col2}>
        <div className={styles.productSpecs}>
          <div className={styles.title2}>產品規格</div>
          <ul>
            <li>
              16&quot; Mini LED WQXGA (2560x1600), 16:10, 240Hz, 3ms, DCI-P3
              100%；副螢幕：14&quot; IPS ScreenPad Plus (3840x1100) 4K
            </li>
            <li>AMD Ryzen 9 7945HX (2.5GHz up to 5.4GHz, 64MB) 16 Cores</li>
            <li>64GB (32GB*2) DDR5-4800 SO-DIMM (2Slot, Max.64GB)</li>
            <li>硬碟: 2TB+2TB PCIe 4.0 NVMe M.2 SSD (RAID 0)</li>
            <li>作業系統: Windows 11 Home</li>
            <li>
              獨顯: NVIDIA GeForce RTX 4090 16GB GDDR6 (具備MUX獨顯直連)
            </li>
            <li>
              無線網路: Wi-Fi 6E(802.11ax) (Triple band) 2*2 + Bluetooth 5.2
            </li>
            <li>1080P FHD@30FPS Camera</li>
            <li>RGB背光鍵盤</li>
            <li>Support NumberPad</li>
            <li>card reader (microSD) (UHS-II, 312MB/s)</li>
            <li>
              I/O: 1*RJ45(2.5G LAN), 1*USB-C 3.2 Gen2 支援 DisplayPort /
              電力供應, 1*USB-C 3.2 Gen2 支援 DisplayPort, 2*USB-A 3.2 Gen2,
              1*HDMI 2.1 FRL, 1*耳機麥克風孔
            </li>
            <li>變壓器: 330W AC Adapter</li>
            <li>重量: 2.67 Kg</li>
            <li>尺寸: 35.5 x 26.6 x 2.05 – 2.97 cm</li>
            <li>2年全球保固 + 首年完美保固</li>
            <li>
              配件: ROG Ranger BP2701 極輕量電競後背包, ROG Fusion II 300
              電競耳機, ROG Gladius III 電競滑鼠
            </li>
          </ul>
        </div>
      </section>

      <section className={styles.col3}>
        <div className={styles.relatedProducts}>
          <span className={styles.diamond}>◇</span>
          <span className={styles.title3}>相關商品</span>
        </div>
      </section>
      <BackToTop />
    </div>
  );
}