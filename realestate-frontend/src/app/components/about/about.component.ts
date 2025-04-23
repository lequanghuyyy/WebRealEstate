import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class AboutComponent {
  // Thông tin về công ty
  companyInfo = {
    established: 2010,
    agents: 120,
    properties: 1500,
    countries: 5,
    offices: 12
  };

  // Đội ngũ lãnh đạo
  teamMembers = [
    {
      name: 'John Smith',
      position: 'CEO & Founder',
      image: '/assets/images/team-1.jpg',
      description: 'With over 20 years of experience in real estate, John leads our company with passion and expertise.'
    },
    {
      name: 'Sarah Johnson',
      position: 'Chief Operations Officer',
      image: '/assets/images/team-2.jpg',
      description: 'Sarah ensures that our operations run smoothly and our clients receive exceptional service.'
    },
    {
      name: 'Michael Chen',
      position: 'Head of Marketing',
      image: '/assets/images/team-3.jpg',
      description: 'Michael brings creativity and innovation to our marketing strategies to showcase properties.'
    },
    {
      name: 'Emily Rodriguez',
      position: 'Lead Real Estate Agent',
      image: '/assets/images/team-4.jpg',
      description: 'Emily has helped hundreds of families find their dream homes with her client-centered approach.'
    }
  ];

  // Lịch sử phát triển công ty
  milestones = [
    {
      year: 2010,
      title: 'Company Founded',
      description: 'RealEstatePro was established with a vision to transform the real estate industry.'
    },
    {
      year: 2013,
      title: 'Expansion to 5 Cities',
      description: 'We expanded our operations to five major cities across the country.'
    },
    {
      year: 2016,
      title: 'Digital Transformation',
      description: 'Launched our digital platform to provide seamless property search and management.'
    },
    {
      year: 2019,
      title: 'International Presence',
      description: 'Opened our first international offices in Canada and Europe.'
    },
    {
      year: 2022,
      title: 'Industry Recognition',
      description: 'Named "Best Real Estate Agency" at the National Housing Awards.'
    }
  ];
} 