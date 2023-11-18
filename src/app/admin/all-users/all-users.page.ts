import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-all-users',
  templateUrl: './all-users.page.html',
  styleUrls: ['./all-users.page.scss'],
})
export class AllUsersPage implements OnInit {
  selectedSegment: string = 'all';
  usersList: any = [];

  constructor(private router: Router, private adminService: AdminService) { }
  ngOnInit() { }

  ionViewWillEnter() {
    this.adminService.getAllUsersList({ selectedTab: this.selectedSegment }).subscribe((res: any) => {
      if (res.success) {
        this.usersList = res.data || [];
      }
    }, (err: any) => {
      console.log(err);
    })
  }

  changeSegment(event: any) {
    this.selectedSegment = event.target.value;
    this.adminService.getAllUsersList({ selectedTab: this.selectedSegment }).subscribe((res: any) => {
      if (res.success) {
        this.usersList = res.data || [];
      }
    }, (err: any) => {
      console.log(err);
    })
  }

  navigateToUserOverview(maker: any) {
    this.router.navigateByUrl('/userOverview/' + maker._id)
  }

  naviageteToProfile() {
    this.router.navigate(['/profile']);
  }

  navigateBackToAdminDashboard() {
    this.router.navigate(['/adminDashboard']);
  }

}
