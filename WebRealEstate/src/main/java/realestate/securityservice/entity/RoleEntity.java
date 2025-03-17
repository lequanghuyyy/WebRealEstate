package realestate.securityservice.entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import realestate.securityservice.constant.Role;

import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "roles")
@AllArgsConstructor
@NoArgsConstructor
public class RoleEntity {

    @Id
    private String id;

    @Enumerated(EnumType.STRING)
    @Column(name = "role_name")
    private Role roleName;

    @ManyToMany(mappedBy = "roles")
    private List<UserEntity> users;

}
