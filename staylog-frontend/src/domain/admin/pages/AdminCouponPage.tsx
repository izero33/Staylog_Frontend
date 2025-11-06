import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, InputGroup } from 'react-bootstrap';
import api from '../../../global/api';


interface couponStateType {
   targetType: 'all' | 'one'
   userId: number
   couponName: string
   discount: number
   expiredAt: string
}

interface couponBoolean {
   userId: boolean
   couponName: boolean
   discount: boolean
   expiredAt: boolean
}

function AdminCouponPage() {

   const [couponState, setCouponState] = useState<couponStateType>({
      targetType: 'one', // 기본값 'all'
      userId: 0,
      couponName: '',
      discount: 0,
      expiredAt: ''
   });

   const [valid, setValid] = useState<couponBoolean>({
      userId: false,
      couponName: false,
      discount: false,
      expiredAt: false
   })

   const [dirty, setDirty] = useState<couponBoolean>({
      userId: false,
      couponName: false,
      discount: false,
      expiredAt: false
   })

   function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      const { name, value } = e.target;

      setCouponState(prevState => ({
         ...prevState,
         [name]: name === 'discount' ? Number(value) : value
      }));
   }


   async function handleSubmit() {
      console.log(couponState.targetType, "로 요청");

      if (couponState.targetType == 'all') {
         try {
            await api.post("/v1/coupon/all", {
               name: couponState.couponName,
               discount: couponState.discount,
               expiredAt: couponState.expiredAt
            })
         } catch (err) {
            console.log(err);
         }

      } else if (couponState.targetType == 'one') {
         try {
            await api.post("/v1/coupon", {
               userId: couponState.userId,
               name: couponState.couponName,
               discount: couponState.discount,
               expiredAt: couponState.expiredAt
            })
         } catch (err) {
            console.log(err);
         }
      }
   }

   return (
      <Container className="my-4">
         <Row className="justify-content-center">
            <Col lg={11} xl={10}>
               <Card className="shadow-sm">
                  <Card.Header as="h3" className="text-center p-3">
                     관리자 쿠폰 발급
                  </Card.Header>
                  
                  <Card.Body className="p-4 p-md-4">

                     <Form>
                        
                        <Row>

                           <Col md={5} className="border-end-md pe-md-4">
                              <Form.Group as="fieldset" className="mb-4 mb-md-0">
                                 <Form.Label as="legend" column sm={12} className="fw-bold fs-5 mb-3">
                                    발급 대상
                                 </Form.Label>
                                 <Form.Check
                                    type="radio"
                                    label="모든 사용자에게 발급"
                                    name="targetType"
                                    id="all"
                                    value="all"
                                    checked={couponState.targetType === 'all'}
                                    onChange={handleChange}
                                 />
                                 <Form.Check
                                    type="radio"
                                    label="특정 사용자에게 발급"
                                    name="targetType"
                                    id="one"
                                    className="mb-2"
                                    value="one"
                                    checked={couponState.targetType === 'one'}
                                    onChange={handleChange}
                                 />

                                 {couponState.targetType == 'one' &&
                                    <Form.Control
                                       type="number"
                                       placeholder="회원 번호를 입력하세요."
                                       name='userId'
                                       value={couponState.userId === 0 ? '' : couponState.userId}
                                       onChange={handleChange}
                                    />
                                 }
                              </Form.Group>
                           </Col>



                           <Col md={7} className="ps-md-4 mt-4 mt-md-0">
                              <h4 className="fw-bold fs-5 mb-3">쿠폰 정보</h4>

                              <Form.Group className="mb-3" controlId="couponName">
                                 <Form.Label>쿠폰 이름</Form.Label>
                                 <Form.Control
                                    type="text"
                                    placeholder="예: 10월 가을맞이 할인 쿠폰"
                                    required
                                    name='couponName'
                                    value={couponState.couponName}
                                    onChange={handleChange}
                                 />
                              </Form.Group>

                              <Row>
                                 <Col sm={6}>
                                    <Form.Group className="mb-3" controlId="couponDiscount">
                                       <Form.Label>할인율</Form.Label>
                                       <InputGroup>
                                          <Form.Control
                                             type="number"
                                             placeholder="10"
                                             min="1"
                                             max="100"
                                             required
                                             name='discount'
                                             value={couponState.discount === 0 ? '' : couponState.discount}
                                             onChange={handleChange}
                                          />
                                          <InputGroup.Text>%</InputGroup.Text>
                                       </InputGroup>
                                    </Form.Group>
                                 </Col>
                                 <Col sm={6}>
                                    <Form.Group className="mb-3" controlId="couponExpiry">
                                       <Form.Label>만료 기간</Form.Label>
                                       <Form.Control
                                          type="date"
                                          required
                                          name='expiredAt'
                                          value={couponState.expiredAt}
                                          onChange={handleChange}
                                       />
                                    </Form.Group>
                                 </Col>
                              </Row>

                              <div className="d-grid mt-3">
                                 <Button onClick={handleSubmit} variant="primary" size="lg" type="submit">
                                    쿠폰 발급하기
                                 </Button>
                              </div>
                           </Col>

                        </Row>
                     </Form>

                  </Card.Body>
               </Card>
            </Col>
         </Row>
      </Container>
   );
}

export default AdminCouponPage;