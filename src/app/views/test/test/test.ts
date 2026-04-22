import { Component, OnInit, signal, WritableSignal} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {TestService} from '../../../shared/services/test-service';
import {QuizType} from '../../../../types/quiz.type';
import {DefaultResponseType} from '../../../../types/default-response.type';
import {FormsModule} from '@angular/forms';
import {ActionTestType} from '../../../../types/action-test.type';
import {UserResultType} from '../../../../types/user-result.type';
import {AuthService} from '../../../core/auth/auth-service';

@Component({
  selector: 'app-test',
  imports: [
    FormsModule
  ],
  templateUrl: './test.html',
  styleUrl: './test.scss',
})
export class Test implements OnInit {

  quiz!:WritableSignal<QuizType> ;
  timerSeconds:WritableSignal<number>=signal<number>( 59);
  private interval: number = 0;
  currentQuestionIndex: number = 1;
  chosenAnswerId: number | null = null;
  userResult: UserResultType[] = [];
  actionTestType: typeof ActionTestType = ActionTestType;

  constructor(private activatedRoute: ActivatedRoute, private testService: TestService,
              private authService: AuthService, private router:Router) {
  }

/////////////////////////////////////
  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      if (params['id']) {
        this.testService.getQuiz(params['id'])
          .subscribe((result:QuizType | DefaultResponseType) => {
            if (result) {
              // т.к. св-ва error нет в обоих типах, а проверить его надо, делаем утверждение, что (result имеет тип DefaultResponseType)
              if ((result as DefaultResponseType).error !== undefined) {
                throw new Error((result as DefaultResponseType).message);
              }
              // так же делаем утверждение типа для выбранного результата

              this.quiz.set( result as QuizType);
              this.startQuiz();
              /////////////////////////////Принудительное обновление страницы///////////////////////
              // this.cd.markForCheck();
            }
          })
      }
    })
  }

//////////////////////////////////
  get activeQuestion() {
    return this.quiz().questions[this.currentQuestionIndex - 1];
  }

///////////////////////////////////
  startQuiz(): void {
    this.interval = window.setInterval(() => {
      this.timerSeconds.set(this.timerSeconds() - 1)  ;
      if (this.timerSeconds() === 0) {
        clearInterval(this.interval);
        this.complete();
      }

    }, 3000)
  }

/////////////////////////////////////
  complete() {
    console.log(this.userResult);
    const userInfo = this.authService.getUserInfo();
    if (userInfo) {
      this.testService.passQuiz(this.quiz().id,userInfo.userId, this.userResult)
        .subscribe(result =>{
          if (result) {
            if ((result as DefaultResponseType).error) {
              throw new Error((result as DefaultResponseType).message);
            }
            this.router.navigate(['result'],{queryParams:{id:this.quiz().id}}) ;
          }
        })
    }
  }

////////////////////////////////////////
  move(action: ActionTestType): void {
    const existingResult: UserResultType | undefined = this.userResult.find((item: UserResultType) => {
      return item.questionId === this.activeQuestion.id
    })

    if (this.chosenAnswerId) {
      if (existingResult) {
        existingResult.chosenAnswerId = this.chosenAnswerId;
      } else {
        this.userResult.push({
          questionId: this.activeQuestion.id,
          chosenAnswerId: this.chosenAnswerId,

        })
      }
    }

    if (action === ActionTestType.next || action === ActionTestType.pass) {
      if (this.currentQuestionIndex === this.quiz().questions.length) {
        clearInterval(this.interval);
        this.complete();
        return;
      }
      this.currentQuestionIndex++;
    } else {
      this.currentQuestionIndex--;
    }

    const currentResult: UserResultType | undefined = this.userResult.find(item => {
      return item.questionId === this.activeQuestion.id;
    })

    if (currentResult) {
      this.chosenAnswerId = currentResult.chosenAnswerId
    } else {
      this.chosenAnswerId = null;
    }
  }

  ////////////////////////////////////
}
