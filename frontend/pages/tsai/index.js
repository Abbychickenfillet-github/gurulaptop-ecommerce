import React, { useState, useEffect } from 'react'
import UserSection from '@/components/user/common/user-section'
import styles from './index.module.scss'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'

export default function UserInfo() {
  const { auth } = useAuth()
  // 從勾子的 context 獲取更新和獲取用戶資訊的函式
  // 未登入時，不會出現頁面內容
  if (!auth.isAuth) return <></>

  return (
    <>
      <UserSection titleCN="個人資訊" titleENG="Information">
        <div
          className={`${styles.basicInformation} row d-flex justify-content-center`}
        >
          <div className={`col-9 ${styles.textArea}`}>
            <div>
              <h4>nickname</h4>
              <div className={`${styles.infoTable} p`}>
                <div>
                  <table>
                    <tbody>
                      <tr>
                        <th>
                          姓名<span> | name</span>
                        </th>
                        <td>{auth.userData.name}</td>
                      </tr>
                      <tr>
                        <th>
                          信箱<span> | email</span>
                        </th>
                        <td>{auth.userData.email}</td>
                      </tr>
                      <tr>
                        <th>
                          生日<span> | birthday</span>
                        </th>
                        <td>{auth.userData.birthday}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div>
                  <table className="ms-4">
                    <tbody>
                      <tr>
                        <th>
                          稱謂<span> | title</span>
                        </th>
                        <td>
                          {' '}
                          {auth.userData.gender === 1
                            ? '男士'
                            : auth.userData.gender === 2
                            ? '女士'
                            : ''}
                        </td>
                      </tr>
                      <tr>
                        <th>
                          手機<span> | phone</span>
                        </th>
                        <td>{auth.userData.phone}</td>
                      </tr>
                      <tr>
                        <th>
                          地址<span> | address</span>
                        </th>
                        <td>{auth.userData.address}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className={`${styles.userImg} col-3 `}>
            <Image
              width={255}
              height={255}
              className={styles.img}
              src={`/user/img/${auth.userData.img}`}
              alt=""
            />
          </div>
          {/* 創建時間 */}
          <div
            className={`${styles.timeArea} "row d-flex justify-content-around align-items-center "`}
          >
            <div className="col-4">
              <table className="ms-4">
                <tbody>
                  <tr>
                    <th>
                      創建時間<span> | created time</span>
                    </th>
                    <td>{auth.userData.created_at}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="col-4">
              <table className="ms-4">
                <tbody>
                  <tr>
                    <th>
                      更新時間<span> | updated time</span>
                    </th>
                    <td>{auth.userData.updated_at}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="col-4 d-flex justify-content-end pe-2">
              <Link href="/user/information/update">
                <button className="btn-primary h6">編輯</button>
              </Link>
            </div>
          </div>

          <hr className="underline"></hr>

          {/* 積分 */}
          <div className="row d-flex py-5 align-items-center">
            <div className="col-10 d-flex align-items-center justify-content-between">
              <div className="col-6">
                <div
                  className={`row ${styles['level-area']} ${styles['table-title']} mt-2`}
                >
                  <div className="col-4 d-flex justify-content-center align-items-center">
                    會員等級
                  </div>
                  <div className="col-4 d-flex justify-content-center align-items-center">
                    會員現有積分
                  </div>
                  <div className="col-4 d-flex justify-content-center align-items-center">
                    會員總積分
                  </div>
                </div>
                <div
                  className={`row ${styles['level-area']} ${styles['table-text']}`}
                >
                  <div className="col-4 d-flex justify-content-center align-items-center">
                    {' '}
                    {auth.userData.level === 1
                      ? '一般會員'
                      : auth.userData.level === 2
                      ? '白金會員'
                      : auth.userData.level === 3
                      ? '鑽石會員'
                      : ''}
                  </div>
                  <div className="col-4 d-flex justify-content-center align-items-center">
                    points
                  </div>
                  <div className="col-4 d-flex justify-content-center align-items-center">
                    points
                  </div>
                </div>
              </div>
              <div className="col-5">
                <div
                  className={`row ${styles['points-description']} ${styles['table-title']} mt-2`}
                >
                  <div className="col-8 d-flex justify-content-center align-items-center">
                    如何獲得點數?
                  </div>
                  <div className="col-4 d-flex justify-content-center align-items-center">
                    折抵規則
                  </div>
                </div>
                <div
                  className={`row ${styles['points-description']} ${styles['table-text']}`}
                >
                  <div className="col-8 d-flex justify-content-center align-items-center">
                    消費滿300元即可獲得1點
                  </div>
                  <div className="col-4 d-flex justify-content-center align-items-center">
                    1點折1元
                  </div>
                </div>
              </div>
            </div>
            <div className="col-10 pt-3 mt-3 justify-content-center  gap-5 d-flex align-items-center">
              <Image src="/user/regular.svg" alt="" width={250} height={192} />
              <Image src="/user/platinum.svg" alt="" width={250} height={192} />
              <Image src="/user/diamond.svg" alt="" width={250} height={192} />
            </div>
          </div>
        </div>
      </UserSection>
    </>
  )
}
