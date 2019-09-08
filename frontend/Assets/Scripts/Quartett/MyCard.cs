using System.Collections;
using System.Collections.Generic;
using TinyRoar.Framework;
using UnityEngine;

public class MyCard : MonoSingleton<MyCard>
{

    private Animator _animator;

    void Start()
    {
        _animator = this.GetComponent<Animator>();
        Events.Instance.OnGameplayStatusChange += GameplayStatusChange;
    }

    void GameplayStatusChange(GameplayStatus oldMatchStatus, GameplayStatus newMatchStatus)
    {

        switch (newMatchStatus)
        {
            case GameplayStatus.GetCard:
                this.AnimateGetCard();
                break;
            case GameplayStatus.OpenCard:
                this.AnimateOpenCard();
                break;
            case GameplayStatus.YouWon:
                this.AnimateWin();
                break;
            case GameplayStatus.YouLost:
                this.AnimateLost();
                break;
        }
    }

    private void AnimateGetCard()
    {
        _animator.Play("MeGetCard");
    }

    private void AnimateOpenCard()
    {
        _animator.Play("MeOpenCard");
    }

    private void AnimateWin()
    {
        _animator.Play("Win");
    }

    private void AnimateLost()
    {
        _animator.Play("Lost");
    }

}
