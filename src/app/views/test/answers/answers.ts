import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {Location} from '@angular/common';
import {QuizType, ResultQuizType} from '../../../../types/quiz.type';
import {UserInfoType} from '../../../../types/user-info.type';
import {AuthService} from '../../../core/auth/auth-service';
import {TestService} from '../../../shared/services/test-service';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-answers',
  imports: [],
  templateUrl: './answers.html',
  styleUrl: './answers.scss',
})
export class Answers implements OnInit {

  email: string | null = null;
  quiz: QuizType | null = null;
  userInfo: UserInfoType | null = null;


  constructor(private activatedRoute: ActivatedRoute,private _location: Location, private authService: AuthService,
              private cd:ChangeDetectorRef,private testService: TestService) {
  }

  backClicked() {
    this._location.back();
  }


  ngOnInit() {
    this.email = this.authService.getEmail();
    this.userInfo = this.authService.getUserInfo();

    this.activatedRoute.params.subscribe(params => {
      if (params['id'] && this.userInfo) {
        this.testService.getAnswersResult(params['id'], this.userInfo.userId)
          .subscribe((result:ResultQuizType) => {

            if (result) {
              console.log(result);
              this.quiz = result.test;
            }
            /////////////////////////////Принудительное обновление страницы///////////////////////
            this.cd.markForCheck();
          })
      }
    })
  }

}
