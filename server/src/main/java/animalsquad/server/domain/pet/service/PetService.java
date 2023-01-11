package animalsquad.server.domain.pet.service;

import animalsquad.server.domain.address.entity.Address;
import animalsquad.server.domain.address.repository.AddressRepository;
import animalsquad.server.domain.pet.entity.Pet;
import animalsquad.server.domain.pet.repository.PetRepository;
import animalsquad.server.global.auth.jwt.JwtTokenProvider;
import animalsquad.server.global.enums.Role;
import animalsquad.server.global.exception.BusinessLogicException;
import animalsquad.server.global.exception.ExceptionCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor // final 붙은 필드 생성자 자동 생성
@Slf4j
public class PetService {

    private final PetRepository petRepository;
    private final AddressRepository addressRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;


    public Pet createPet(Pet pet) {
        verifyExistsId(pet.getLoginId());
        pet.setPassword(passwordEncoder.encode(pet.getPassword()));
        pet.setRoles(Collections.singletonList(Role.ROLE_USER.name()));

        int code = pet.getAddress().getCode();

        Optional<Address> optionalAddress = addressRepository.findByCode(code);
        Address address = optionalAddress.orElseThrow(() -> new BusinessLogicException(ExceptionCode.ADDRESS_NOT_FOUND));

        pet.setAddress(address);

        return petRepository.save(pet);
    }

    public Pet updatePet(Pet pet, String token) {
        Pet findPet = findVerifiedPet(pet.getId());

        verifiedToken(pet.getId(), token);

        Optional.ofNullable(pet.getPetName())
                .ifPresent(name -> findPet.setPetName(name));
        Optional.ofNullable(pet.getAge())
                .ifPresent(age -> findPet.setAge(age));
        Optional.ofNullable(pet.getGender())
                .ifPresent(gender -> findPet.setGender(gender));
        Optional.ofNullable(pet.getProfileImage())
                .ifPresent(profileImage -> findPet.setProfileImage(profileImage));

        Optional.ofNullable(pet.getAddress().getCode())
                .ifPresent(code -> {
                    Address address = verifiedAddress(code);
                    findPet.setAddress(address);
                });

        Pet savedPet = petRepository.save(findPet);

        return savedPet;

    }

    private Address verifiedAddress(int code) {
        Optional<Address> optionalAddress = addressRepository.findByCode(code);
        Address address = optionalAddress.orElseThrow(() -> new BusinessLogicException(ExceptionCode.ADDRESS_NOT_FOUND));
        return address;
    }

    // 커뮤니티 기능 구현 전 나의 정보만 조회

    public Pet findPet(long id, String token) {
        verifiedToken(id, token);

        return findVerifiedPet(id);
    }
    // redis 설정 시 refreshToken 삭제 추가

    public void deletePet(long id, String token) {
        findVerifiedPet(id);

        verifiedToken(id, token);

        petRepository.deleteById(id);
    }
    private void verifyExistsId(String loginId) {
        Optional<Pet> pet = petRepository.findByLoginId(loginId);

        if (pet.isPresent()) {
            throw new BusinessLogicException(ExceptionCode.PET_EXISTS);
        }
    }

    private Pet findVerifiedPet(long id) {
        Optional<Pet> optionalPet = petRepository.findById(id);
        Pet findPet = optionalPet.orElseThrow(() ->
                new NoSuchElementException(ExceptionCode.PET_NOT_FOUND.getMessage()));

        return findPet;
    }

    private void verifiedToken(long id, String token) {
        long petId = jwtTokenProvider.getPetId(token);

        if (petId != id) {
            throw new BusinessLogicException(ExceptionCode.TOKEN_AND_ID_NOT_MATCH);
        }
    }

}
