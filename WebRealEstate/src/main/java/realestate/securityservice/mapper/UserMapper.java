package realestate.securityservice.mapper;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import realestate.securityservice.dto.request.UserCreationRequest;
import realestate.securityservice.dto.respone.UserResponse;
import realestate.securityservice.entity.UserEntity;

@Component
public class UserMapper {
    private final ModelMapper modelMapper;

    @Autowired
    public UserMapper(ModelMapper modelMapper) {
        this.modelMapper = modelMapper;
    }

    public UserResponse convertToUserResponse(UserEntity userEntity) {
        UserResponse userResponse = modelMapper.map(userEntity, UserResponse.class);
        userResponse.setId(userEntity.getId());
        return userResponse;
    }
    public UserEntity convertToUserEntity(UserCreationRequest userCreationRequest) {
        return modelMapper.map(userCreationRequest, UserEntity.class);
    }
}
