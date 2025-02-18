import { Icon } from '@iconify/react';
import axios from 'axios';
import React, { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Swal from 'sweetalert2';
import { Background, Box, LeftDiv, RightDiv } from '../Components/Box';
import Button from '../Components/Button';
import Input from '../Components/Input';
import Cat from '../img/catface.png';
import Dog from '../img/dogface.png';
import color from '../util/color';
import { codeToAddress } from '../util/ConvertAddress';
import headers from '../util/formDataHeaders';
import AddressModal from './AddressModal';
import { ProfileImageFormData, UserInfo as IUserInfo } from '../types';

const { ivory, brown, yellow, darkivory, bordergrey, red } = color;

const UserInfo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id, petname, password } = location.state;
  const [info, setInfo] = useState<IUserInfo>({
    petName: '',
    isMale: 'MALE',
    isCat: 'CAT',
    age: 0,
  });
  const [address, setAddress] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<ProfileImageFormData>({ profileImage: null });
  const [fileImage, setFileImage] = useState<string>();

  const [ageErrorMessage, setAgeErrorMessage] = useState<string>('');
  const [addrErrorMessage, setAddrErrorMessage] = useState<string>('');
  const ageRef = useRef<HTMLInputElement>(null);
  const addrRef = useRef<HTMLInputElement>(null);

  const saveFileImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    setFileImage(URL.createObjectURL(event.target.files[0]));
    const { name, files } = event.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    }
  };

  const ageHandler = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setInfo({ ...info, age: Number(e.target.value) });
  };

  const catHandler = () => {
    if (info.isCat === 'CAT') {
      setInfo({ ...info, isCat: 'DOG' });
    } else {
      setInfo({ ...info, isCat: 'CAT' });
    }
  };

  const openAddressModal = () => {
    setIsOpen(!isOpen);
  };

  const backgroundRef: React.RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);

  window.addEventListener('click', (e) => {
    if (e.target === backgroundRef.current) {
      setIsOpen(false);
    }
  });

  const submitHandler = async () => {
    printErrorMessage();

    if (info.age !== 0 && id !== '' && password !== '' && address) {
      const data = new FormData();
      data.append('loginId', id);
      data.append('password', password);
      data.append('petName', info.petName);
      data.append('age', info.age.toString());
      data.append('species', info.isCat);
      data.append('gender', info.isMale);
      data.append('code', address.toString());
      if (formData.profileImage) {
        data.append('profileImage', formData.profileImage);
      }

      try {
        await axios.post(`${process.env.REACT_APP_API_ROOT}/pets/signup`, data, { headers });
        Swal.fire({
          title: '회원가입이 완료되었습니다.',
          icon: 'success',
          confirmButtonText: '<b>확인</b>',
          confirmButtonColor: yellow,
          color: brown,
          padding: '20px 0px',
        });
        navigate('/');
      } catch (error) {
        console.error('Error', error);
      }
    }
  };

  const printErrorMessage = () => {
    if (info.age === 0) {
      setAgeErrorMessage('나이를 입력해주세요.');
      ageRef.current && ageRef.current.focus();
    } else {
      setAgeErrorMessage('');
    }

    if (!address) {
      setAddrErrorMessage('주소를 선택해주세요.');
      addrRef.current && addrRef.current.focus();
    } else {
      setAddrErrorMessage('');
    }
  };

  return (
    <Container>
      <Background ref={backgroundRef} />
      <Box>
        <LeftDiv>
          <AvatarDiv>
            {fileImage ? (
              <img
                className='userprofile'
                alt='sample'
                src={fileImage}
                style={{ margin: 'auto', width: '175px', height: '175px' }}
              />
            ) : info.isCat === 'CAT' ? (
              <img
                className='baseimojicat'
                src={Cat}
                style={{ width: '100px', height: '100px' }}
              ></img>
            ) : (
              <img
                className='baseimojidog'
                src={Dog}
                style={{ width: '100px', height: '100px' }}
              ></img>
            )}
          </AvatarDiv>
          <NameDiv>{petname}</NameDiv>
          <PlusDiv>
            <form>
              <label className='input-file-button' htmlFor='input-file'>
                {WhitePlusSVG}
              </label>
              <input
                type='file'
                id='input-file'
                name='profileImage'
                onChange={saveFileImage}
                style={{ display: 'none' }}
              />
            </form>
          </PlusDiv>
          <PlusDiv className='invisible'>
            <form>
              <label className='input-file-button' htmlFor='input-file'>
                {YellowPlusSVG}
              </label>
              <input
                type='file'
                id='input-file'
                name='profileImage'
                onChange={saveFileImage}
                style={{ display: 'none' }}
              />
            </form>
          </PlusDiv>
          <input type='file' id='input-file' style={{ display: 'none' }} />
        </LeftDiv>
        <RightDiv>
          <InputsDiv>
            <InputDiv>
              <Input
                type='text'
                placeholder='나이'
                marginBottom='35px'
                onChange={ageHandler}
                ref={ageRef}
              />
              <MessageDiv>{ageErrorMessage}</MessageDiv>
            </InputDiv>
            <InputDiv>
              <Input
                type='text'
                readOnly={true}
                placeholder={address === null ? '어디에 사시나요?' : `${codeToAddress(address)}`}
                marginBottom='35px'
                openAddressModal={openAddressModal}
                ref={addrRef}
              />
              <SvgSpan onClick={openAddressModal}>
                <Icon icon='ic:baseline-search' color='#7d5a5a' style={{ fontSize: '23px' }} />
              </SvgSpan>
              <MessageDiv>{addrErrorMessage}</MessageDiv>
            </InputDiv>
          </InputsDiv>
          <GenderDiv isMale={info.isMale}>
            <TextSpan>성별</TextSpan>
            <IconButton onClick={() => setInfo({ ...info, isMale: 'MALE' })}>
              <Icon icon='mdi:gender-male' color='#6C92F2' style={{ fontSize: '48px' }} />
            </IconButton>
            <IconButton onClick={() => setInfo({ ...info, isMale: 'FEMALE' })}>
              <Icon icon='mdi:gender-female' color='#F87D7D' style={{ fontSize: '48px' }} />
            </IconButton>
          </GenderDiv>
          <TypeDiv>
            <TextSpan>저는...</TextSpan>
            <ToggleDiv>
              <CircleDiv
                onClick={catHandler}
                isCat={info.isCat}
                className={info.isCat === 'CAT' ? 'cat' : 'dog'}
              />
              <CatSpan onClick={catHandler} isCat={info.isCat}>
                <img src={Cat} style={{ width: '36px' }}></img>
              </CatSpan>
              <DogSpan onClick={catHandler} isCat={info.isCat}>
                <img src={Dog} style={{ width: '36px' }}></img>
              </DogSpan>
            </ToggleDiv>
          </TypeDiv>
          <ButtonDiv>
            <Button text='시작하기' onClick={submitHandler} />
          </ButtonDiv>
        </RightDiv>
      </Box>
      {isOpen && <AddressModal address={address} setAddress={setAddress} setIsOpen={setIsOpen} />}
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  .baseimojidog {
    margin-top: 30px;
  }
  .baseimojicat {
    margin-top: 35px;
  }
`;

const AvatarDiv = styled.div`
  width: 175px;
  height: 175px;
  margin-top: 140px;
  border-radius: 50%;
  background-color: ${ivory};
  line-height: 180px;

  display: flex;
  justify-content: center;

  .userprofile {
    border-radius: 50%;
    object-fit: cover;
  }
`;

const NameDiv = styled.div`
  margin-top: 28px;
  font-size: 32px;
  font-weight: bold;
  color: white;
`;

const PlusDiv = styled.div`
  position: absolute;
  top: 270px;
  right: 525px;

  &.invisible {
    display: none;
  }

  &:hover + .invisible {
    display: block;
  }

  label {
    cursor: pointer;
  }
`;

const InputsDiv = styled.div`
  margin-top: 73px;
  display: flex;
  flex-direction: column;
`;

const InputDiv = styled.div`
  position: relative;
`;

const SvgSpan = styled.span`
  position: absolute;
  top: 14px;
  right: 12px;
  cursor: pointer;
`;

const GenderDiv = styled.div<{ isMale: string }>`
  width: 233px;
  margin-bottom: 35px;
  display: flex;
  justify-content: space-around;
  align-items: center;

  button:first-of-type {
    ${(props) => props.isMale === 'MALE' && `background-color: ${darkivory}`}
  }

  button:last-of-type {
    ${(props) => props.isMale === 'FEMALE' && `background-color: ${darkivory}`}
  }
`;

const TypeDiv = styled.div`
  width: 233px;
  display: flex;
  justify-content: space-around;
  align-items: center;
`;

const TextSpan = styled.span`
  font-size: 18px;
  font-weight: bold;
  color: ${brown};
`;

const IconButton = styled.button`
  padding: 17px;
  background: none;
  border: none;
  border-radius: 18px;
  cursor: pointer;

  &:hover {
    background-color: ${darkivory};
  }
`;

const ToggleDiv = styled.div`
  width: 166px;
  height: 64px;
  border: 1px solid ${bordergrey};
  background-color: white;
  border-radius: 50px;
  position: relative;
`;

const CircleDiv = styled.div<{ isCat: string; className: string }>`
  width: 58px;
  height: 58px;
  border-radius: 50px;
  background-color: ${yellow};
  position: absolute;
  top: 2px;
  cursor: pointer;
  transition: all 0.6s;

  &.cat {
    transform: translateX(2px);
  }

  &.dog {
    transform: translateX(104px);
  }
`;

const CatSpan = styled.span<{ isCat: string }>`
  font-size: 36px;
  position: absolute;
  top: 11px;
  left: 12px;
  cursor: pointer;
  user-select: none;
`;

const DogSpan = styled.span<{ isCat: string }>`
  font-size: 36px;
  position: absolute;
  top: 9px;
  right: 12px;
  cursor: pointer;
  user-select: none;
`;

const ButtonDiv = styled.div`
  margin-top: 45px;
`;

const MessageDiv = styled.div`
  width: 102%;
  font-size: 14px;
  font-weight: 500;
  color: ${red};
  position: absolute;
  top: 69%;
  text-align: center;
`;

const WhitePlusSVG = (
  <svg width='38' height='38' viewBox='0 0 38 38' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <circle cx='18.5' cy='19.5' r='13.5' fill='#7D5A5A' />
    <path
      d='M26.9167 20.5833H20.5834V26.9167H17.4167V20.5833H11.0834V17.4167H17.4167V11.0833H20.5834V17.4167H26.9167M19.0001 3.16667C16.9208 3.16667 14.8619 3.57621 12.9409 4.37191C11.0199 5.16761 9.27448 6.33389 7.80422 7.80415C4.8349 10.7735 3.16675 14.8007 3.16675 19C3.16675 23.1993 4.8349 27.2265 7.80422 30.1959C9.27448 31.6661 11.0199 32.8324 12.9409 33.6281C14.8619 34.4238 16.9208 34.8333 19.0001 34.8333C23.1993 34.8333 27.2266 33.1652 30.1959 30.1959C33.1653 27.2265 34.8334 23.1993 34.8334 19C34.8334 16.9207 34.4239 14.8618 33.6282 12.9408C32.8325 11.0199 31.6662 9.27441 30.1959 7.80415C28.7257 6.33389 26.9802 5.16761 25.0592 4.37191C23.1382 3.57621 21.0793 3.16667 19.0001 3.16667V3.16667Z'
      fill='#FFEEDB'
    />
  </svg>
);

const YellowPlusSVG = (
  <svg width='38' height='38' viewBox='0 0 38 38' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <circle cx='18.5' cy='19.5' r='13.5' fill='white' />
    <path
      d='M26.9167 20.5833H20.5834V26.9167H17.4167V20.5833H11.0834V17.4167H17.4167V11.0833H20.5834V17.4167H26.9167M19.0001 3.16667C16.9208 3.16667 14.8619 3.57621 12.9409 4.37191C11.0199 5.16761 9.27448 6.33389 7.80422 7.80415C4.8349 10.7735 3.16675 14.8007 3.16675 19C3.16675 23.1993 4.8349 27.2265 7.80422 30.1959C9.27448 31.6661 11.0199 32.8324 12.9409 33.6281C14.8619 34.4238 16.9208 34.8333 19.0001 34.8333C23.1993 34.8333 27.2266 33.1652 30.1959 30.1959C33.1653 27.2265 34.8334 23.1993 34.8334 19C34.8334 16.9207 34.4239 14.8618 33.6282 12.9408C32.8325 11.0199 31.6662 9.27441 30.1959 7.80415C28.7257 6.33389 26.9802 5.16761 25.0592 4.37191C23.1382 3.57621 21.0793 3.16667 19.0001 3.16667V3.16667Z'
      fill='#FFC57E'
    />
  </svg>
);

export default UserInfo;
